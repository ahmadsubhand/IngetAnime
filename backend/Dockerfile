# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy application source
COPY . .

# Generate Prisma Client and build NestJS
RUN npx prisma generate
RUN npm run build

# Remove development dependencies
RUN npm prune --omit=dev

# ==================================================

# Production stage
FROM node:24-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

# Install PM2 process manager
RUN npm install --global pm2 \
    && apk add --no-cache dumb-init \
    && chown node:node /app

# Copy production dependencies and compiled application
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --chown=node:node ecosystem.config.cjs ./

# Run as non-root user
USER node

# Port 4000 for production environment
EXPOSE 4000

ENTRYPOINT ["dumb-init", "--"]
CMD ["pm2-runtime", "start", "ecosystem.config.cjs"]
