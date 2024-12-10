const { Client } = require('pg');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
require('dotenv').config();  // Cargar las variables del archivo .env

// Configuración de la base de datos PostgreSQL
const client = new Client({
  host: process.env.DB_HOST,  
  port: process.env.DB_PORT,  
  user: process.env.DB_USER,  
  password: process.env.DB_PASSWORD,  
  database: process.env.DB_NAME,  
});

// Conectar a la base de datos
client.connect()
  .then(() => console.log("Conexión a la base de datos establecida"))
  .catch(err => console.error("Error de conexión a la base de datos", err));

// Configuración del servicio de correo (Mailtrap)
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,  // Tomarán los valores desde el .env
  port: process.env.MAIL_PORT,  
  auth: {
    user: process.env.MAIL_USER,  
    pass: process.env.MAIL_PASS   
  },
  secure: false, 
  tls: {
    rejectUnauthorized: false  // Esto es útil si hay problemas con certificados
  }
});

// Función para enviar correo
const sendMail = (to, subject, text) => {
  const mailOptions = {
    from: process.env.MAIL_USER,  // Tomará el valor desde el .env
    to: to,
    subject: subject,
    text: text
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error al enviar el correo:', error);
    } else {
      console.log('Correo enviado:', info.response);
    }
  });
};

// Función para obtener datos disponibles y no notificados
const fetchDataFromDB = async () => {
  try {
    const res = await client.query('SELECT * FROM datos WHERE disponible = true AND notificado = false');
    return res.rows;
  } catch (err) {
    console.error('Error al obtener datos de la base de datos:', err);
    return [];
  }
};

// Función para marcar un dato como notificado
const markAsNotified = async (id) => {
  try {
    await client.query('UPDATE datos SET notificado = true WHERE id = $1', [id]);
    console.log(`Dato con ID ${id} marcado como notificado.`);
  } catch (err) {
    console.error('Error al actualizar el dato:', err);
  }
};

// Cron job para verificar datos cada 5 segundos
cron.schedule('*/5 * * * * *', async () => {
  const data = await fetchDataFromDB();
  if (data.length > 0) {
    data.forEach(async (dato) => {
      // Enviar correo por cada dato disponible y no notificado
      sendMail('Jonuelcollado@gmail.com', 'Nuevo Dato Disponible', `El dato ${dato.nombre} está disponible.`);
      
      // Marcar el dato como notificado
      await markAsNotified(dato.id);
    });
  }
});

// Cerrar la conexión cuando ya no sea necesaria
process.on('exit', () => {
  client.end();
});
