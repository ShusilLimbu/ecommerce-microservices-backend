FROM node:20-alpine
WORKDIR /app
COPY packages/shared ./packages/shared
COPY services/auth-service ./services/auth-service
WORKDIR /app/services/auth-service
RUN npm install --omit=dev
EXPOSE 3001
CMD ["sh", "-c", "node src/db/migrate.js && node src/index.js"]
