FROM node:20-alpine as build

ARG NPM_AUTH_TOKEN
ARG NPM_REGISTRY=//npm.pkg.github.com/

WORKDIR /app

COPY package.json .

COPY .npmrc .
RUN echo -e "\n${NPM_REGISTRY}:_authToken=${NPM_AUTH_TOKEN}" >> .npmrc

RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/.next/standalone .
COPY --from=build /app/.next/static .next/static/

EXPOSE 3000

CMD PORT=3000 node server.js
