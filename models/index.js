'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Puppy = require('./Puppy')(sequelize, DataTypes);
const VisitRequest = require('./VisitRequest')(sequelize, DataTypes);
const User = require('./User')(sequelize, DataTypes);
const RefreshToken = require('./RefreshToken')(sequelize, DataTypes);

Puppy.hasMany(VisitRequest, { foreignKey: 'puppy_id', as: 'visit_requests' });
VisitRequest.belongsTo(Puppy, { foreignKey: 'puppy_id', as: 'puppy' });
User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refresh_tokens', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = { sequelize, Puppy, VisitRequest, User, RefreshToken };
