'use strict';

const { sequelize } = require('../models');

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Database synchronized');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
