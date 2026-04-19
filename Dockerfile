# Base image for building
FROM node:22-alpine AS base

# Install pnpm and dependencies for build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy configuration files and enable hoisting
COPY .npmrc pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/worker/package.json ./apps/worker/
COPY apps/dashboard/package.json ./apps/dashboard/
COPY libs/common/package.json ./libs/common/
COPY libs/domain/package.json ./libs/domain/
COPY libs/drizzle/package.json ./libs/drizzle/
COPY libs/kafka/package.json ./libs/kafka/
COPY libs/tenant/package.json ./libs/tenant/

# Install all dependencies with hoisting enabled
RUN pnpm install --frozen-lockfile

# ---------------------------------------------------------
# API Builder
# ---------------------------------------------------------
FROM base AS api-builder
COPY apps/api ./apps/api
COPY libs ./libs
COPY tsconfig.json ./
RUN pnpm --filter api build

# ---------------------------------------------------------
# Worker Builder
# ---------------------------------------------------------
FROM base AS worker-builder
COPY apps/worker ./apps/worker
COPY libs ./libs
COPY tsconfig.json ./
RUN pnpm --filter worker build

# ---------------------------------------------------------
# Dashboard Builder
# ---------------------------------------------------------
FROM base AS dashboard-builder
COPY apps/dashboard ./apps/dashboard
COPY libs ./libs
COPY tsconfig.json ./

# We build with a placeholder so we can swap it at runtime
ENV NEXT_PUBLIC_API_URL="__NEXT_PUBLIC_API_URL_PLACEHOLDER__"
RUN pnpm --filter dashboard build

# ---------------------------------------------------------
# Runtime: API
# ---------------------------------------------------------
FROM node:22-alpine AS api
RUN apk add --no-cache curl
WORKDIR /app

# Copy root node_modules (which now contains all hoisted dependencies like axios)
COPY --from=base --chown=node:node /app/node_modules ./node_modules
# Copy the built application and its structure
COPY --from=api-builder --chown=node:node /app/apps/api/dist ./apps/api/dist
COPY --from=api-builder --chown=node:node /app/apps/api/package.json ./apps/api/package.json
COPY --from=base --chown=node:node /app/package.json ./package.json

# Ensure non-root user
USER node

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/v1/health || exit 1

# Execute from the monorepo-relative path
CMD ["node", "apps/api/dist/apps/api/src/main"]

# ---------------------------------------------------------
# Runtime: Worker
# ---------------------------------------------------------
FROM node:22-alpine AS worker
RUN apk add --no-cache curl
WORKDIR /app

# Copy root node_modules
COPY --from=base --chown=node:node /app/node_modules ./node_modules
# Copy the built application
COPY --from=worker-builder --chown=node:node /app/apps/worker/dist ./apps/worker/dist
COPY --from=worker-builder --chown=node:node /app/apps/worker/package.json ./apps/worker/package.json
COPY --from=base --chown=node:node /app/package.json ./package.json

# Ensure non-root user
USER node

# Health check for worker
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3002/health || exit 1

CMD ["node", "apps/worker/dist/apps/worker/src/main"]

# ---------------------------------------------------------
# Runtime: Dashboard
# ---------------------------------------------------------
FROM node:22-alpine AS dashboard
RUN apk add --no-cache bash curl
WORKDIR /app

# Copy root node_modules and built dashboard
COPY --from=base --chown=node:node /app/node_modules ./node_modules
COPY --from=dashboard-builder --chown=node:node /app/apps/dashboard/.next ./apps/dashboard/.next
COPY --from=dashboard-builder --chown=node:node /app/apps/dashboard/public ./apps/dashboard/public
COPY --from=dashboard-builder --chown=node:node /app/apps/dashboard/package.json ./apps/dashboard/package.json

# Copy and setup the entrypoint script
COPY --chown=node:node apps/dashboard/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Ensure non-root user
USER node

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

ENTRYPOINT ["/app/entrypoint.sh"]

# ---------------------------------------------------------
# Tool: Migrator
# ---------------------------------------------------------
FROM base AS migrator
COPY scripts ./scripts
COPY drizzle ./drizzle
COPY libs/drizzle ./libs/drizzle
# We need tsx to run the migration script
RUN pnpm install -g tsx
CMD ["pnpm", "db:migrate"]
