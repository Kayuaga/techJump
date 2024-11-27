FROM node:20-alpine

WORKDIR /app

COPY .next/standalone/node_modules ./node_modules
COPY .next/standalone/projects/techjumpapp ./
COPY .next/static .next/static/
RUN ls

EXPOSE 3000

CMD PORT=3000 node server.js

