FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

RUN apk add --no-cache curl

COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY src ./src

EXPOSE 3000

CMD ["node", "src/infrastructure/server.js"]
