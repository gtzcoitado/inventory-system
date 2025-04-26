# 1) Build do front
FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install
COPY frontend/ .
RUN npm run build

# 2) Prep do backend
FROM node:18-alpine AS backend
WORKDIR /app
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install
COPY backend/ .

# 3) Copia o build do front para o servidor
COPY --from=frontend-builder /app/frontend/build ../frontend/build

ENV NODE_ENV=production
WORKDIR /app/backend
EXPOSE 4000
CMD ["node", "server.js"]
