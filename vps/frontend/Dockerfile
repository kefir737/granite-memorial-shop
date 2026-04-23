FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN sed -i '/<script src="https:\/\/cdn\.poehali\.dev/d' index.html && \
    sed -i '/<meta name="pp-name"/d' index.html && \
    npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY vps/frontend/nginx.conf /etc/nginx/conf.d/default.conf