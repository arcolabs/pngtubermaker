# ── Stage 1: Install dependencies ──────────────────────────────────
# Monorepo: the app lives in apps/web, the lockfile lives at the root.
# Zeabur builds this Dockerfile with the repository root as context.
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/package.json
RUN bun install --frozen-lockfile

# ── Stage 2: Build ────────────────────────────────────────────────
FROM oven/bun:1 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY . .

# Build args become env vars during build (needed for NEXT_PUBLIC_* vars)
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_CONTACT_EMAIL
ARG NEXT_PUBLIC_SOCIAL_DISCORD
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Dummy DATABASE_URL for build-time page collection (not used for actual connections)
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"

RUN bun run --cwd apps/web build

# ── Stage 3: Production ──────────────────────────────────────────
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# DB timestamps are naive local time — pin UTC so they align with external
# systems (upstream API logs, R2, Stripe). Rows written before this change are
# UTC-8 (cutover: 2026-06-10).
ENV TZ=UTC

# sharp runtime dependency (libvips, not libvips-dev) + curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    libvips \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output. In a workspace, Next.js nests the standalone server
# under apps/web; its server.js does process.chdir(__dirname), so static
# assets, public files and i18n messages must land beside it.
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/messages ./apps/web/messages

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", "apps/web/server.js"]
