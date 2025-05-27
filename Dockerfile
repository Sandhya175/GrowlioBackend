FROM node:23.9.0-alpine3.21 AS build

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .

FROM node:23.9.0-alpine3.21

WORKDIR /usr/src/app
COPY --from=build /usr/src/app /usr/src/app
RUN npm ci --only=production

EXPOSE 5000

CMD ["node", "server.js"]
