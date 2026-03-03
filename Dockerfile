FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies
RUN pnpm install

# Copy source files
COPY . .

# Build the frontend
RUN pnpm build

# Expose the port
EXPOSE 3456

# Start the server
CMD ["pnpm", "start"] 