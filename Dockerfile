FROM node:19-alpine3.16

WORKDIR /app

COPY . /app

RUN npm install

EXPOSE 3000
