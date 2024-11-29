const { Client } = require('pg');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
require('dotenv').config();  // Cargar las variables del archivo .env

// Configuración de la base de datos PostgreSQL
const client = new Client({
  host: process.env.DB_HOST,  // Tomará el valor desde el .env o 'postgres' si no está definida
  port: process.env.DB_PORT,  // Tomará el valor desde el .env o 5432 por defecto
  user: process.env.DB_USER,  // Tomará el valor desde el .env o 'postgres' por defecto
  password: process.env.DB_PASSWORD,  // Tomará el valor desde el .env o '1234' por defecto
  database: process.env.DB_NAME,  // Tomará el valor desde el .env o 'mydb' por defecto
});

// Conectar a la base de datos
client.connect()
  .then(() => console.log("Conexión a la base de datos establecida"))
  .catch(err => console.error("Error de conexión a la base de datos", err));

// Configuración del servicio de correo (Mailtrap, por ejemplo)
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,  // Tomará el valor desde el .env o 'smtp.mailtrap.io' por defecto
  port: process.env.MAIL_PORT,  // Tomará el valor desde el .env o 587 por defecto
  auth: {
    user: process.env.MAIL_USER,  // Tomará el valor desde el .env
    pass: process.env.MAIL_PASS   // Tomará el valor desde el .env
  },
  secure: false,  // Si usas STARTTLS, `secure` debe ser `false`
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
