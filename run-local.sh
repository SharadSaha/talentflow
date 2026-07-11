#!/usr/bin/env bash
# =============================================================================
# TalentFlow — local development runner
#
# Starts the full stack for local development:
#   • PostgreSQL + Redis   → via Docker Compose (disposable, prod-like)
#   • Backend  (Express)   → natively with hot reload  (http://localhost:4000)
#   • Frontend (Vite/React)→ natively with HMR         (http://localhost:5173)
#
# It also:
#   • verifies prerequisites (node, npm, docker)
#   • creates .env files from .env.example if missing
#   • installs dependencies if node_modules are missing
#   • generates the Prisma client
#   • waits for the database to be healthy before starting the backend
#   • shuts everything down cleanly on Ctrl+C
#
# Usage:
#   ./run-local.sh [options]
#
# Options:
#   --skip-install   Do not run npm install (assume deps are present)
#   --no-docker      Do not manage Postgres/Redis (use your own local services)
#   --keep-db        Leave Postgres/Redis running after the script exits
#   -h, --help       Show this help and exit
# =============================================================================

set -euo pipefail

# ---- Resolve repo root (this script's directory) ----------------------------
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# ---- Options ----------------------------------------------------------------
SKIP_INSTALL=false
USE_DOCKER=true
KEEP_DB=false

# ---- Colors / logging -------------------------------------------------------
if [[ -t 1 ]]; then
  BOLD="$(printf '\033[1m')"; DIM="$(printf '\033[2m')"; RESET="$(printf '\033[0m')"
  BLUE="$(printf '\033[34m')"; GREEN="$(printf '\033[32m')"
  YELLOW="$(printf '\033[33m')"; RED="$(printf '\033[31m')"; CYAN="$(printf '\033[36m')"
else
  BOLD=""; DIM=""; RESET=""; BLUE=""; GREEN=""; YELLOW=""; RED=""; CYAN=""
fi

log()   { printf "%s\n" "${BLUE}${BOLD}▶${RESET} $*"; }
ok()    { printf "%s\n" "${GREEN}✔${RESET} $*"; }
warn()  { printf "%s\n" "${YELLOW}⚠${RESET} $*"; }
err()   { printf "%s\n" "${RED}✖${RESET} $*" >&2; }

usage() {
  # Print the leading comment banner (skip the shebang, stop at first non-comment).
  awk 'NR==1 { next } /^#/ { sub(/^# ?/, ""); print; next } { exit }' "${BASH_SOURCE[0]}"
  exit 0
}

# ---- Parse args -------------------------------------------------------------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-install) SKIP_INSTALL=true ;;
    --no-docker)    USE_DOCKER=false ;;
    --keep-db)      KEEP_DB=true ;;
    -h|--help)      usage ;;
    *) err "Unknown option: $1"; echo "Run './run-local.sh --help' for usage."; exit 1 ;;
  esac
  shift
done

# ---- PIDs of the dev servers we spawn ---------------------------------------
BACKEND_PID=""
FRONTEND_PID=""

# ---- Recursively kill a process and its descendants -------------------------
kill_tree() {
  local pid="$1"
  [[ -z "$pid" ]] && return 0
  local child
  for child in $(pgrep -P "$pid" 2>/dev/null || true); do
    kill_tree "$child"
  done
  kill "$pid" 2>/dev/null || true
}

# ---- Cleanup on exit --------------------------------------------------------
cleanup() {
  trap - EXIT INT TERM
  echo
  log "Shutting down..."

  [[ -n "$BACKEND_PID" ]]  && { kill_tree "$BACKEND_PID";  ok "Backend stopped"; }
  [[ -n "$FRONTEND_PID" ]] && { kill_tree "$FRONTEND_PID"; ok "Frontend stopped"; }

  if [[ "$USE_DOCKER" == true && "$KEEP_DB" == false ]]; then
    log "Stopping database services..."
    docker compose stop postgres redis >/dev/null 2>&1 || true
    ok "Database services stopped (data volumes preserved)"
  elif [[ "$USE_DOCKER" == true && "$KEEP_DB" == true ]]; then
    warn "Leaving Postgres/Redis running (--keep-db). Stop with: docker compose stop postgres redis"
  fi

  ok "Done. 👋"
}
trap cleanup EXIT INT TERM

# ---- Prerequisite checks ----------------------------------------------------
require() {
  command -v "$1" >/dev/null 2>&1 || { err "Required command not found: $1"; exit 1; }
}

log "Checking prerequisites..."
require node
require npm
if [[ "$USE_DOCKER" == true ]]; then
  require docker
  if ! docker info >/dev/null 2>&1; then
    err "Docker is installed but the daemon is not running. Start Docker Desktop and retry."
    exit 1
  fi
fi
ok "Node $(node -v), npm $(npm -v)$( [[ "$USE_DOCKER" == true ]] && echo ", Docker $(docker version -f '{{.Server.Version}}' 2>/dev/null)")"

# ---- Ensure .env files ------------------------------------------------------
ensure_env() {
  local dir="$1"
  if [[ ! -f "$dir/.env" && -f "$dir/.env.example" ]]; then
    cp "$dir/.env.example" "$dir/.env"
    ok "Created $dir/.env from .env.example"
  fi
}
log "Ensuring environment files..."
ensure_env backend
ensure_env frontend
ok "Environment files ready"

# ---- Install dependencies ---------------------------------------------------
install_deps() {
  local name="$1" dir="$2"
  if [[ "$SKIP_INSTALL" == false && ! -d "$dir/node_modules" ]]; then
    log "Installing $name dependencies..."
    npm --prefix "$dir" install
    ok "$name dependencies installed"
  fi
}
if [[ "$SKIP_INSTALL" == false && ! -d "node_modules" ]]; then
  log "Installing root dependencies..."
  npm install
  ok "Root dependencies installed"
fi
install_deps "backend" backend
install_deps "frontend" frontend

# ---- Start database services ------------------------------------------------
if [[ "$USE_DOCKER" == true ]]; then
  log "Starting Postgres & Redis (Docker)..."
  docker compose up -d postgres redis

  wait_healthy() {
    local container="$1" tries=0 max=60
    printf "%s" "${DIM}Waiting for ${container} to be healthy${RESET}"
    until [[ "$(docker inspect -f '{{.State.Health.Status}}' "$container" 2>/dev/null || echo starting)" == "healthy" ]]; do
      tries=$((tries + 1))
      if (( tries > max )); then
        echo; err "$container did not become healthy in time."; exit 1
      fi
      printf "."
      sleep 1
    done
    echo
    ok "$container is healthy"
  }
  wait_healthy talentflow-postgres
  wait_healthy talentflow-redis
else
  warn "Skipping Docker DB services (--no-docker). Ensure Postgres & Redis are reachable per backend/.env"
fi

# ---- Generate Prisma client -------------------------------------------------
log "Generating Prisma client..."
npm --prefix backend run prisma:generate >/dev/null
ok "Prisma client generated"
# NOTE: no migrations exist yet (no models). Once models are added, run:
#   npm --prefix backend run prisma:migrate

# ---- Start dev servers ------------------------------------------------------
echo
log "Starting application dev servers..."
printf "%s\n" "${DIM}  Backend logs are prefixed by npm; Ctrl+C stops everything.${RESET}"
echo

npm --prefix backend run dev &
BACKEND_PID=$!

npm --prefix frontend run dev &
FRONTEND_PID=$!

sleep 2
echo
printf "%s\n" "${GREEN}${BOLD}TalentFlow is starting up:${RESET}"
printf "  %s Frontend  %s\n" "${CYAN}→${RESET}" "http://localhost:5173"
printf "  %s Backend   %s\n" "${CYAN}→${RESET}" "http://localhost:4000"
printf "  %s Health    %s\n" "${CYAN}→${RESET}" "http://localhost:4000/health"
if [[ "$USE_DOCKER" == true ]]; then
  printf "  %s Postgres  %s\n" "${CYAN}→${RESET}" "localhost:5432"
  printf "  %s Redis     %s\n" "${CYAN}→${RESET}" "localhost:6379"
fi
printf "\n%s\n\n" "${DIM}Press Ctrl+C to stop.${RESET}"

# Wait until either dev server exits, then cleanup runs via the EXIT trap.
# (Poll loop instead of `wait -n` for macOS bash 3.2 compatibility.)
while kill -0 "$BACKEND_PID" 2>/dev/null && kill -0 "$FRONTEND_PID" 2>/dev/null; do
  sleep 1
done

if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
  warn "Backend process exited."
elif ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
  warn "Frontend process exited."
fi
