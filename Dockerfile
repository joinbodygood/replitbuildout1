# =============================================
#  Body Good Platform (PA/Eligibility + E-commerce)
#  Multi-stage production Docker build
# =============================================

# -- Stage 1: Dependencies --
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# -- Stage 2: Build --
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# -- Stage 3: Production runtime --
# NOTE: next.config.ts does not set output:"standalone", so we
# copy the full .next directory and use `npm start` to serve.
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=5000
ENV HOSTNAME="0.0.0.0"

# Security: non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Install production deps only (need next at runtime)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy Prisma schema + generated client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy built assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/tsconfig.json ./

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/ || exit 1

CMD ["npx", "next", "start", "-p", "5000", "-H", "0.0.0.0"]
