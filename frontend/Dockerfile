# syntax=docker/dockerfile:1

# =============================================================================
# TalentFlow Frontend — multi-stage production image (build + nginx)
# =============================================================================

# ---- Stage 1: build ---------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# The API base URL is baked into the client bundle at build time.
ARG VITE_API_BASE_URL=http://localhost:4000/api
ARG VITE_APP_NAME=TalentFlow
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_APP_NAME=${VITE_APP_NAME}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Stage 2: serve ---------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

# Replace the default site config with our SPA-aware one.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the compiled static assets.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
