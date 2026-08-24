# --- Builder Stage ---
FROM node:25-alpine AS builder

WORKDIR /app

RUN mkdir -p /data/pglite

# Copy package files and install dependencies (cached layer)
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the SvelteKit application
RUN npm run build

# --- Production Stage ---
FROM node:25-alpine

WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/scripts ./scripts

EXPOSE 3000

# Chain the migration script before starting the server
CMD ["sh", "-c", "node scripts/migrate.ts && node build"]

