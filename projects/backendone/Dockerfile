FROM node:20-alpine

WORKDIR /app

COPY package.json .
COPY config ./config
COPY migrations ./migrations
COPY .sequelizerc .

# look into optimisation
RUN npm i sequelize-cli
RUN npm i pg
RUN npm i sequelize


COPY ./build .

EXPOSE 3003

CMD ["node", "app.js"]


