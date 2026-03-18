const User = require('./User');
const Post = require('./Post');

User.hasMany(Post, {
  foreignKey: 'userId',
  as: 'posts',
  onDelete: 'CASCADE'
});

Post.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = {
  User,
  Post
};
