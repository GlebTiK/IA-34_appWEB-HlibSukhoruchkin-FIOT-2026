'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Puppy', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    age_months: { type: DataTypes.INTEGER, allowNull: false },
    price_uah: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    photo_url: { type: DataTypes.STRING(1024), allowNull: true }
  }, {
    tableName: 'puppies',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });
};
