
# The instructions for the first stage
FROM node:10-alpine as builder

COPY . /civicsense_students_be

WORKDIR /civicsense_students_be
RUN apk --no-cache add --virtual builds-deps build-base python \
RUN rm -rf node_modules && \
    npm install && \
    npm run tslint && \
    npm run tsc

# The instructions for second stage
FROM node:10-alpine

#WORKDIR /usr/src/app
COPY --from=builder /civicsense_students_be /civicsense_students_be

RUN apk --no-cache add --virtual builds-deps build-base python \
     curl && \
     adduser -u 502 -h /civicsense_students_be -D -H api && chown -R api /civicsense_students_be
WORKDIR /civicsense_students_be
RUN rm -rf node_modules && \
    rm -rf src && \
    npm install --production


USER apollo
EXPOSE 3000
CMD npm start
