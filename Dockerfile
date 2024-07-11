FROM node:lts-alpine

WORKDIR /server

COPY package*.json ./
RUN npm install

COPY tsconfig.json .
COPY . .

COPY config.env .env

EXPOSE 3000

CMD ["sh", "-c", "npm run build && npm run start"]
