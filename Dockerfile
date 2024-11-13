FROM golang:alpine3.20 AS build

RUN apk update && apk add --no-cache nodejs npm make

WORKDIR /app-build

COPY . .

RUN go mod download

RUN npm install

RUN make build

RUN npm run prod

FROM alpine:3.20

WORKDIR /app

COPY --from=build /app-build/build/frontend-server /app/frontend-server

COPY --from=build /app-build/public /app/public

EXPOSE 4000

CMD ["./frontend-server"]
