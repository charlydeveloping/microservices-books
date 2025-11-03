FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY src ./src

EXPOSE 4000

CMD ["node", "src/infrastructure/server.js"]
