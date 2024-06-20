FROM hub.lumigame.com/base/playwright:v1.24.0-focal
ARG gameId

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

RUN mkdir -p /app/tests/$gameId
COPY tests/$gameId-* /app/tests/$gameId
COPY playwright.config.ts .
COPY package.json .
COPY .npmrc .

RUN test -n "$gameId" || (echo "gameId not set" && false)

RUN npm install
RUN npx playwright@1.44 install chromium