'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Puppy = require('./Puppy')(sequelize, DataTypes);
const VisitRequest = require('./VisitRequest')(sequelize, DataTypes);

Puppy.hasMany(VisitRequest, { foreignKey: 'puppy_id', as: 'visit_requests' });
VisitRequest.belongsTo(Puppy, { foreignKey: 'puppy_id', as: 'puppy' });

module.exports = { sequelize, Puppy, VisitRequest };
