FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/scripts ./scripts
# Copy ALL node_modules needed by scripts/llm-call.mjs (runs outside webpack)
COPY --from=builder /app/node_modules/@anthropic-ai ./node_modules/@anthropic-ai
COPY --from=builder /app/node_modules/@aws-sdk ./node_modules/@aws-sdk
COPY --from=builder /app/node_modules/@aws-crypto ./node_modules/@aws-crypto
COPY --from=builder /app/node_modules/@smithy ./node_modules/@smithy
COPY --from=builder /app/node_modules/tslib ./node_modules/tslib
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
