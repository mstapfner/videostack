# Use Node.js 18 Alpine as base image for smaller size
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM node:18-alpine AS runner

# Install pnpm in production stage too
RUN npm install -g pnpm

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set working directory
WORKDIR /app

# Copy necessary files from base stage
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/public ./public
COPY --from=base /app/.next ./.next
COPY --from=base /app/next.config.mjs ./next.config.mjs

# Set correct permissions for prerender cache
RUN chown nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV PORT 3000
ENV NODE_ENV production

# Start the application
CMD ["node", "server.js"]
