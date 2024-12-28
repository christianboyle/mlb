# Build stage
FROM node:20 AS builder
WORKDIR /app

# Install specific npm version and configure
RUN npm install -g npm@10.2.4 && \
    npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-factor 2 && \
    npm config set fetch-retry-mintimeout 10000 && \
    npm config set fetch-retry-maxtimeout 60000

# Copy package files first
COPY package*.json ./

# Install dependencies and Rollup
RUN npm install --no-optional --no-fund --no-audit && \
    npm install @rollup/rollup-linux-x64-gnu

# Copy source (excluding node_modules due to .dockerignore)
COPY . .

# Build
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

# Copy built assets and server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.js ./server.js

# Install production dependencies
RUN npm install --omit=dev --no-optional --no-fund --no-audit

# Expose port
EXPOSE 3456

# Start the app
CMD ["npm", "start"] 