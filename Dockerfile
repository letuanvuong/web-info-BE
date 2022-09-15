FROM node:14 AS buildstage
ARG APP_VERSION
ADD . /app
WORKDIR /app
RUN sed -i 's/APP_VERSION/'$APP_VERSION'/' ./src/appInfo.json
RUN npm install
RUN npm run gen
RUN npm run build
RUN npm prune --production

FROM node:lts-alpine@sha256:0a6a21d28509f56155007444075ef4fdd36eef0a97924623cb641d3766e3b8d3
ARG APP_VERSION
ENV TZ Asia/Ho_Chi_Minh
RUN apk add dumb-init
RUN apk --no-cache add tzdata && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
ENV NODE_ENV production
ENV GRAPHQL_ENDPOINT_PATH /graphqlwebinfo
ENV APP_PORT 80
EXPOSE 80
# EXPOSE 15042
WORKDIR /app
COPY --chown=node:node --from=buildstage /app /app
RUN touch /app/${APP_VERSION}
RUN chmod -R 777 /app
RUN ls /app
USER node
CMD ["dumb-init","node","dist/main.js"]
