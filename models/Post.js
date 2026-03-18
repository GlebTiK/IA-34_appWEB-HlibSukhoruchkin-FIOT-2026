const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define(
  'Post',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  },
  {
    tableName: 'posts',
    timestamps: true
  }
);

module.exports = Post;
