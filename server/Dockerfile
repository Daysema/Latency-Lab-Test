FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY . .

ENV DB_PATH=/data/stats.db
EXPOSE 3000

CMD ["node", "index.js"]
