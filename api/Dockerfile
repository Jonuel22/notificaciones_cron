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

# Expón el puerto en el que se ejecuta la API
EXPOSE 3000

# Comando para ejecutar la API
CMD ["npm", "start"]
