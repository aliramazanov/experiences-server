FROM node:lts-alpine

WORKDIR /server

COPY package.json .
RUN npm install

COPY tsconfig.json .
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
