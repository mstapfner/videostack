# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files, including the new lock file
COPY package.json package-lock.json ./

# Install dependencies using npm's clean install command
RUN npm ci

# Copy source code
COPY . .

# Build the static export
RUN npm run build

# Production stage - use nginx to serve static files
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files from builder
COPY --from=builder /app/out /usr/share/nginx/html

# Expose port
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
