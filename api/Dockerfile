
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY src ./src
RUN chown -R node:node /app
USER node
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "src/server.js"]