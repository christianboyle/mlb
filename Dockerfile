FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Enable a lockfile-compatible pnpm via corepack
RUN corepack enable && corepack prepare pnpm@8.14.1 --activate

# Install dependencies exactly as locked
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Build the frontend
RUN pnpm build

# Expose the port
EXPOSE 3456

# Start the server
CMD ["pnpm", "start"] 