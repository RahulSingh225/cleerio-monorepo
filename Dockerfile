# Base image for building
FROM node:22-alpine AS base

# Install pnpm and dependencies for build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy configuration files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/worker/package.json ./apps/worker/
COPY apps/dashboard/package.json ./apps/dashboard/
COPY libs/common/package.json ./libs/common/
COPY libs/domain/package.json ./libs/domain/
COPY libs/drizzle/package.json ./libs/drizzle/
COPY libs/kafka/package.json ./libs/kafka/
COPY libs/tenant/package.json ./libs/tenant/

# Install dependencies (frozen-lockfile for consistency)
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
WORKDIR /app
COPY --from=api-builder /app/node_modules ./node_modules
COPY --from=api-builder /app/apps/api/dist ./apps/api/dist
COPY --from=api-builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=api-builder /app/libs ./libs

EXPOSE 3000
CMD ["node", "apps/api/dist/main"]

# ---------------------------------------------------------
# Runtime: Worker
# ---------------------------------------------------------
FROM node:22-alpine AS worker
WORKDIR /app
COPY --from=worker-builder /app/node_modules ./node_modules
COPY --from=worker-builder /app/apps/worker/dist ./apps/worker/dist
COPY --from=worker-builder /app/apps/worker/package.json ./apps/worker/package.json
COPY --from=worker-builder /app/libs ./libs

CMD ["node", "apps/worker/dist/main"]

# ---------------------------------------------------------
# Runtime: Dashboard
# ---------------------------------------------------------
FROM node:22-alpine AS dashboard
WORKDIR /app

# Install bash for the entrypoint script
RUN apk add --no-network --no-cache bash

COPY --from=dashboard-builder /app/apps/dashboard/.next ./apps/dashboard/.next
COPY --from=dashboard-builder /app/apps/dashboard/public ./apps/dashboard/public
COPY --from=dashboard-builder /app/apps/dashboard/package.json ./apps/dashboard/package.json
COPY --from=dashboard-builder /app/node_modules ./node_modules

# Create an entrypoint script to replace the placeholder
RUN echo '#!/bin/bash\n\
if [ -n "$NEXT_PUBLIC_API_URL" ]; then\n\
  echo "Replacing API URL placeholder with $NEXT_PUBLIC_API_URL..."\n\
  # Find all JS files in .next and replace the placeholder\n\
  find apps/dashboard/.next -type f -name "*.js" -exec sed -i "s|__NEXT_PUBLIC_API_URL_PLACEHOLDER__|$NEXT_PUBLIC_API_URL|g" {} +\n\
fi\n\
exec node_modules/.bin/next start apps/dashboard --port 3000\n\
' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/app/entrypoint.sh"]
