FROM node:20
WORKDIR /app
COPY package*.json /app
COPY . /app
RUN rm -rf node_modules
RUN npm install --verbose
RUN rm src/env/.env.development && rm src/env/.env.production
RUN npm run build
RUN mkdir -p /app/dist/env
RUN mv src/env/.env.nexus /app/dist/env/.env.nexus
EXPOSE 3005
