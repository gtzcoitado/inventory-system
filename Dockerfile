# etapa 1: build do React
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend

# só copia package.json para aproveitar cache
COPY frontend/package*.json ./
RUN npm install

# copia todo o código do frontend e gera o build
COPY frontend/ ./
RUN npm run build

# etapa 2: prepara o backend
FROM node:18-alpine AS backend
WORKDIR /app/backend

# copia e instala deps do backend
COPY backend/package*.json ./
RUN npm install --production

# copia código do backend
COPY backend/ ./

# traz o build estático do estágio frontend-builder
COPY --from=frontend-builder /app/frontend/build ../frontend/build

# define variáveis de ambiente
ENV NODE_ENV=production
EXPOSE 4000

# comando final: inicia o Express que serve o React build
CMD ["node", "server.js"]
