FROM oven/bun:1.3.0-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production=false

FROM oven/bun:1.3.0-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build:web
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD wget -qO- http://127.0.0.1:3000/api/health/live >/dev/null || exit 1
USER bun
CMD ["bun", "run", "server.ts"]
