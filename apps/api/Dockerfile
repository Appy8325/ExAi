FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages/ packages/
RUN pnpm install --frozen-lockfile --filter api... --include-workspace-root

FROM deps AS builder
COPY . .
RUN pnpm build --filter api...

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 appgroup && adduser --system --uid 1001 appuser appgroup
COPY --from=builder /app .
USER appuser
EXPOSE 3001
CMD ["node", "apps/api/dist/main.js"]
