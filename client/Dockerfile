# Build project
FROM node:alpine AS builder

RUN apk update && apk add --no-cache make git

WORKDIR /build

RUN npm install -g @angular/cli

COPY dintechApp/package*.json ./
RUN npm install

COPY dintechApp/. .

RUN ng build

# Run project
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html

COPY --from=builder /build/dist/dintechApp /usr/share/nginx/html
COPY --from=builder /build/nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]