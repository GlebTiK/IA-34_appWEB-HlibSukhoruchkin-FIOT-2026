'use strict';

const { Sequelize } = require('sequelize');
require('dotenv').config();

function parseBool(value, defaultValue) {
  if (value === undefined || value === null || value === '') return defaultValue;
  return ['1', 'true', 'yes', 'y'].includes(String(value).toLowerCase().trim());
}

const useSsl = parseBool(process.env.DB_SSL, false);

const baseOptions = {
  dialect: 'mysql',
  dialectModule: require('mysql2'),
  logging: false,
  dialectOptions: Object.assign(
    { dateStrings: true },
    useSsl ? { ssl: { rejectUnauthorized: false } } : {}
  )
};

let sequelize;

if (process.env.MYSQL_URL && String(process.env.MYSQL_URL).trim()) {
  sequelize = new Sequelize(String(process.env.MYSQL_URL).trim(), baseOptions);
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    Object.assign({}, baseOptions, {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306)
    })
  );
}

module.exports = sequelize;
