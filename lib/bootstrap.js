const sequelize = require('../config/database');
const pool = require('../db/raw');
require('../models');

let initPromise = null;

async function initApp() {
  if (!initPromise) {
    initPromise = (async () => {
      await sequelize.authenticate();

      await pool.execute('SELECT 1');

      await sequelize.sync();
    })().catch((error) => {
      initPromise = null;
      throw error;
    });
  }

  return initPromise;
}

module.exports = initApp;
