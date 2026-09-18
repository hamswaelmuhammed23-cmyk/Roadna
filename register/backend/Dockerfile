# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/roadna-web
COPY roadna-web/package*.json ./
RUN npm install
COPY roadna-web/ ./
RUN npm run build

# Stage 2: Run Node Express Backend
FROM node:20-alpine
WORKDIR /app/backend

# Copy backend package files and install production dependencies
COPY register/backend/package*.json ./
RUN npm install --only=production

# Copy backend source files
COPY register/backend/ ./

# Copy built frontend assets to the location expected by server.js (../../roadna-web/dist)
COPY --from=frontend-builder /app/roadna-web/dist /roadna-web/dist

# Expose backend port
EXPOSE 5002

CMD ["node", "server.js"]
