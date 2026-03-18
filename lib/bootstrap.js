const sequelize = require('../config/database');
const pool = require('../db/raw');
require('../models');

let initPromise = null;

async function initApp() {
  if (!initPromise) {
    initPromise = (async () => {
      await sequelize.authenticate();

      // Quick raw-SQL check to satisfy the lab requirement of working via mysql2
      await pool.execute('SELECT 1');

      // Creates users and posts tables if they do not exist
      await sequelize.sync();
    })().catch((error) => {
      initPromise = null;
      throw error;
    });
  }

  return initPromise;
}

module.exports = initApp;
