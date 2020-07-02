FROM node:14-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

FROM node:14-alpine
ENV NODE_ENV=production
RUN apk add --no-cache tini
WORKDIR /app
RUN chown node:node .
USER node
COPY package.json yarn.lock ./
RUN yarn install && yarn cache clean
COPY --from=builder /app/dist/ dist/
EXPOSE 3000
ENTRYPOINT [ "/sbin/tini","--", "node", "dist/index.js" ]