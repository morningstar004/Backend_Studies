FROM node:22-bookworm-slim

ENV NODE_ENV=production \
    PORT=8000

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --chown=node:node src ./src
COPY --chown=node:node public ./public

USER node

EXPOSE 8000

CMD ["node", "src/index.js"]
