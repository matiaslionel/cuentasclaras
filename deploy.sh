#!/bin/bash

# Definir variables
IMAGE_NAME="matiaslionel/cuentasclaras"
TIMESTAMP=$(date +%Y%m%d%H%M%S)
TAG="v$TIMESTAMP"

echo "🚀 Iniciando despliegue de $IMAGE_NAME:$TAG"

# Construir la imagen con BuildKit habilitado y sin caché
echo "🔨 Construyendo imagen Docker..."
DOCKER_BUILDKIT=1 docker build --no-cache --build-arg CACHEBUST=$TIMESTAMP -t $IMAGE_NAME:$TAG -t $IMAGE_NAME:latest .

# Verificar si la construcción fue exitosa
if [ $? -ne 0 ]; then
    echo "❌ Error al construir la imagen"
    exit 1
fi

echo "✅ Imagen construida correctamente"

# Preguntar si se desea subir la imagen a Docker Hub
read -p "¿Deseas subir la imagen a Docker Hub? (s/n): " PUSH_IMAGE

if [ "$PUSH_IMAGE" = "s" ] || [ "$PUSH_IMAGE" = "S" ]; then
    echo "🔄 Subiendo imagen a Docker Hub..."
    docker push $IMAGE_NAME:$TAG
    docker push $IMAGE_NAME:latest
    
    if [ $? -ne 0 ]; then
        echo "❌ Error al subir la imagen"
        exit 1
    fi
    
    echo "✅ Imagen subida correctamente"
fi

echo "🎉 Proceso completado"
echo "Ahora puedes actualizar tu stack en Portainer usando la imagen $IMAGE_NAME:$TAG o $IMAGE_NAME:latest"
