FROM node:20-alpine
WORKDIR /app
COPY packages/shared ./packages/shared
COPY services/order-service ./services/order-service
WORKDIR /app/services/order-service
RUN npm install --omit=dev
EXPOSE 3003
CMD ["sh", "-c", "node src/db/migrate.js && node src/index.js"]
