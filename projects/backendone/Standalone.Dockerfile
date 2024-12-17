FROM node:20-alpine as build

WORKDIR /app

COPY package.json .

RUN npm install

COPY rollup.config.js .
COPY app.js .

RUN npm run build

RUN ls

FROM node:20-alpine

COPY --from=build /app/build .

EXPOSE 3003

CMD ["node", "app.js"]
