FROM node:20-alpine
WORKDIR /app
COPY packages/shared ./packages/shared
COPY services/user-service ./services/user-service
WORKDIR /app/services/user-service
RUN npm install --omit=dev
EXPOSE 3002
CMD ["sh", "-c", "node src/db/migrate.js && node src/index.js"]
