FROM node:18-alpine3.17
WORKDIR /app
ARG COMMIT_HASH
ENV COMMIT_HASH=$COMMIT_HASH
ARG BUILD_TIME
ENV BUILD_TIME=$BUILD_TIME

ADD dist ./dist
ADD src ./src
COPY package.json .
COPY babel.config.js .
COPY webpack.config.js .

EXPOSE 3000
RUN apk add --update --no-cache make gcc g++ python3 && ln -sf python3 /usr/bin/python
RUN npm install
RUN npm run build
CMD ["npm", "start"]
