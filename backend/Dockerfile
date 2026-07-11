# syntax=docker/dockerfile:1

# =============================================================================
# TalentFlow Backend — multi-stage production image
# =============================================================================

# ---- Stage 1: build ---------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# OpenSSL is required by Prisma's query engine.
RUN apk add --no-cache openssl

# Install ALL dependencies (including dev) for building.
COPY package*.json ./
RUN npm ci

# Generate the Prisma client and compile TypeScript.
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- Stage 2: production dependencies --------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm ci --omit=dev

# ---- Stage 3: runtime -------------------------------------------------------
FROM node:22-alpine AS runtime
WORKDIR /app

RUN apk add --no-cache openssl wget

ENV NODE_ENV=production
ENV PORT=4000

# Production node_modules, compiled output, generated Prisma client & schema.
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/generated ./generated
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY package*.json ./

# Run as the built-in non-root `node` user.
USER node

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

CMD ["node", "dist/server.js"]
