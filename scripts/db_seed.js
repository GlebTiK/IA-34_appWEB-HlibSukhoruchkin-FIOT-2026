'use strict';

const { sequelize, Puppy } = require('../models');

const puppies = [
  { name: 'Buddy', description: 'Friendly puppy', age_months: 4, price_uah: 12000, photo_url: '/img/puppy-1.jpg' },
  { name: 'Luna', description: 'Calm and playful puppy', age_months: 5, price_uah: 15000, photo_url: '/img/puppy-2.jpg' },
  { name: 'Rocky', description: 'Active puppy', age_months: 3, price_uah: 11000, photo_url: '/img/puppy-3.jpg' }
];

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    for (const item of puppies) {
      await Puppy.findOrCreate({ where: { name: item.name }, defaults: item });
    }
    console.log('Seed data inserted');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
