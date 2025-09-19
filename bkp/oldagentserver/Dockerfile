FROM node:18-alpine AS base

FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
# Set working directory
WORKDIR /app
# Install Turbo
RUN npm install -g turbo
COPY . .

# Generate a partial monorepo with a pruned lockfile for dockerserver
RUN turbo prune dockerserver --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install Turbo
RUN npm install -g turbo

# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm ci

# Build the project
COPY --from=builder /app/out/full/ .
RUN turbo build --filter=dockerserver

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 dockerserver

# Copy built application
COPY --from=installer --chown=dockerserver:nodejs /app/packages/dockerserver/dist ./dist
COPY --from=installer --chown=dockerserver:nodejs /app/packages/dockerserver/package.json ./package.json

# Copy the built shared-types (since it's a workspace dependency)
COPY --from=installer --chown=dockerserver:nodejs /app/packages/shared-types ./packages/shared-types

# Copy node_modules (production dependencies)
COPY --from=installer --chown=dockerserver:nodejs /app/node_modules ./node_modules

USER dockerserver

# Expose the port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Start the application
CMD ["npm", "start"]