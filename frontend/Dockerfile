# Desarrollo: Next.js con hot reload
FROM node:20-alpine

WORKDIR /app

# Copiar solo dependencias primero (mejor cache)
COPY package.json package-lock.json* yarn.lock* ./

RUN npm install

COPY . .

EXPOSE 3000

# El comando se puede sobreescribir en docker-compose (ej. npm run dev)
CMD ["npm", "run", "dev"]
