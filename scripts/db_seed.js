use strict';

require('dotenv').config();
const { sequelize, Puppy } = require('../models');

const seedData = [
  { name: 'Луна', description: 'Дружня, грайлива та дуже любить людей. Ідеальна для сімʼї.', age_months: 4, price_uah: 8500.00, photo_url: 'assets/images/puppy-hero.png' },
  { name: 'Макс', description: 'Енергійний щеня, любить прогулянки та ігри з мʼячем.', age_months: 5, price_uah: 9200.00, photo_url: 'assets/images/puppy2.png' }
];

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    const count = await Puppy.count();
    if (count === 0) {
      await Puppy.bulkCreate(seedData);
    }
    console.log('Seed data inserted');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
