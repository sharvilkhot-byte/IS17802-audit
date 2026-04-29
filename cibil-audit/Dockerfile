FROM mcr.microsoft.com/playwright:v1.59.1-jammy

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV PORT=3000
ENV HEADLESS=true
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/src/server.js"]
