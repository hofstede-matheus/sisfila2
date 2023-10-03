FROM node:18-alpine3.15

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

COPY .env.example ./.env

EXPOSE 3001

CMD [ "npm", "run", "start:dev"]