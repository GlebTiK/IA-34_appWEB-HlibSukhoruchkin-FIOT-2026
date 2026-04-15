'use strict';

const { Sequelize } = require('sequelize');
require('dotenv').config();

function parseBool(v, defVal) {
  if (v === undefined || v === null || v === '') return defVal;
  const s = String(v).toLowerCase().trim();
  return s === '1' || s === 'true' || s === 'yes' || s === 'y';
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
