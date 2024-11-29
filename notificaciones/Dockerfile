# Utiliza una imagen base de Node.js
FROM node:16

# Define el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia el archivo package.json y package-lock.json (si existe)
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código fuente
COPY . .

# Expón el puerto (si es necesario)
EXPOSE 3001

# Comando para ejecutar el servicio de notificaciones
CMD ["npm", "start"]
