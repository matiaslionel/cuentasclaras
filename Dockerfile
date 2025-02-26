# Etapa de construcción
FROM node:20-alpine as build

WORKDIR /app

# Agregar un argumento para forzar la reconstrucción
ARG CACHEBUST=1
# Mostrar el valor de CACHEBUST para verificar que está funcionando
RUN echo "Building with CACHEBUST=${CACHEBUST}"

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código fuente - esto siempre debe invalidar la caché
COPY . .

# Forzar la reconstrucción de la aplicación
RUN echo "Rebuilding at $(date)" && npm run build

# Etapa de producción
FROM nginx:alpine

# Copiar la configuración de nginx personalizada si es necesario
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos de construcción desde la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Agregar un archivo de versión para verificar
RUN echo "Build date: $(date)" > /usr/share/nginx/html/version.txt

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"] 