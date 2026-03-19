const { Sequelize } = require('sequelize');

function buildSequelize() {
  const useSsl = String(process.env.DB_SSL || 'false').toLowerCase() === 'true';

  if (process.env.MYSQL_URL) {
    return new Sequelize(process.env.MYSQL_URL, {
      dialect: 'mysql',
      logging: false,
      dialectModule: require('mysql2'),
      dialectOptions: useSsl
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: true
            }
          }
        : {}
    });
  }

  return new Sequelize(
    process.env.DB_NAME || 'web_backend_lab',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'password',
    {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      dialect: 'mysql',
      logging: false,
      dialectOptions: useSsl
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false
            }
          }
        : {}
    }
  );
}

const sequelize = global.__lab2_sequelize || buildSequelize();

if (!global.__lab2_sequelize) {
  global.__lab2_sequelize = sequelize;
}

module.exports = sequelize;
