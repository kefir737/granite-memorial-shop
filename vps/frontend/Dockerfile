FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY public/konstruktor /usr/share/nginx/html/konstruktor
COPY vps/frontend/nginx.conf /etc/nginx/conf.d/default.conf