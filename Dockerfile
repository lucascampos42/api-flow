# Use the official Bun image
FROM oven/bun:latest as builder

WORKDIR /app

# Copy package.json and lockfile
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN bun x prisma generate

# Build the application
RUN bun run build

# Production image
FROM oven/bun:latest

WORKDIR /app

# Copy built assets and dependencies from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Set environment to production
ENV NODE_ENV=production

# Expose port (default NestJS port is usually 3000, adjust if needed)
EXPOSE 3000

# Run the app
CMD ["bun", "run", "dist/main.js"]
