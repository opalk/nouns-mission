import knex from 'knex';
import dotenv from 'dotenv';
dotenv.config();

const db = knex({
  client: 'mysql',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});

//checking connection
db.raw('SELECT 1')
  .then(() => console.log('Connected to MySQL database'))
  .catch((error) => {
    console.error('Error connecting to MySQL database:', error);
    process.exit(1); // Exit process on connection failure
  });

export default db;