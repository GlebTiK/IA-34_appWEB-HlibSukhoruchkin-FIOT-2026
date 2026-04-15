'use strict';

const fs = require('fs');
const { Sequelize } = require('sequelize');
require('dotenv').config();

function parseBool(v, defVal) {
  if (v === undefined || v === null || v === '') return defVal;
  const s = String(v).toLowerCase().trim();
  return s === '1' || s === 'true' || s === 'yes' || s === 'y';
}

const useSsl = parseBool(process.env.DB_SSL, false);

const sslOptions = useSsl
  ? {
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true,
        ca: process.env.DB_CA_PATH ? fs.readFileSync(process.env.DB_CA_PATH) : undefined
      }
    }
  : {};

const baseOptions = {
  dialect: 'mysql',
  dialectModule: require('mysql2'),
  logging: false,
  dialectOptions: {
    dateStrings: true,
    ...sslOptions
  }
};

let sequelize;

if (process.env.MYSQL_URL && String(process.env.MYSQL_URL).trim()) {
  sequelize = new Sequelize(String(process.env.MYSQL_URL).trim(), baseOptions);
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      ...baseOptions,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 4000)
    }
  );
}

module.exports = sequelize;
