# Usar una imagen base de Node.js
FROM node:20-alpine

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos de configuración del proyecto
COPY package*.json ./
COPY postcss.config.js ./
COPY tailwind.config.js ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Exponer el puerto
EXPOSE 4173

# Comando para ejecutar la aplicación en modo preview
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"] 