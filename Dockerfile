# Use Node14+Alpine para rodar apenas o backend + servir o build estático
FROM node:18-alpine

# Cria pasta da API
WORKDIR /app/backend

# Copia e instala deps do backend
COPY backend/package*.json ./
RUN npm install --omit=dev

# Copia o código da API
COPY backend/ ./

# Copia o build estático já gerado do React
COPY frontend/build ../frontend/build

# Exponha a porta
EXPOSE 4000

# Ambiente de produção
ENV NODE_ENV=production

# Inicia o servidor Express (que serve /api e ../frontend/build)
CMD ["node", "server.js"]
