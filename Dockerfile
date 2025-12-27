# Base stage
FROM node:20-alpine AS base

# Dependencies stage
FROM base AS deps
WORKDIR /app

COPY package.json yarn.lock ./
# Install dependencies (including devDependencies for build)
RUN yarn install --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app

COPY package.json yarn.lock ./
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma

COPY src ./src
COPY tsconfig.json ./
COPY nest-cli.json ./

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN yarn build

# Production run stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma


# Change ownership to non-root user
RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 8080

CMD ["node", "dist/main"]