'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('VisitRequest', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    puppy_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    visitor_name: { type: DataTypes.STRING(255), allowNull: false },
    phone: { type: DataTypes.STRING(64), allowNull: false },
    visit_datetime: { type: DataTypes.DATE, allowNull: false },
    note: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.ENUM('pending','approved','rejected'), allowNull: false, defaultValue: 'pending' }
  }, {
    tableName: 'visit_requests',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });
};
