const express = require('express');
const initApp = require('./lib/bootstrap');
const pool = require('./db/raw');
const { User, Post } = require('./models');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());

app.use(async (req, res, next) => {
  try {
    await initApp();
    next();
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({
      message: 'Database initialization failed',
      error: error.message
    });
  }
});

app.get('/', (req, res) => {
  res.json({
    message: 'Lab 2 API is running on Vercel',
    endpoints: {
      health: 'GET /health',
      rawUsersList: 'GET /sql/users',
      rawUserCreate: 'POST /sql/users',
      rawUserUpdate: 'PUT /sql/users/:id',
      rawUserDelete: 'DELETE /sql/users/:id',
      ormUsersList: 'GET /orm/users',
      ormUserCreate: 'POST /orm/users',
      ormPostsList: 'GET /orm/posts',
      ormPostCreate: 'POST /orm/posts',
      ormUserPosts: 'GET /orm/users/:id/posts'
    }
  });
});

app.get('/health', async (req, res) => {
  const [rows] = await pool.execute('SELECT NOW() AS serverTime');
  res.json({
    status: 'ok',
    databaseTime: rows[0].serverTime
  });
});

// --------------------
// mysql2 / raw SQL
// --------------------
app.get('/sql/users', async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT id, name, email, createdAt, updatedAt FROM users ORDER BY id ASC'
  );
  res.json(rows);
});

app.post('/sql/users', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      message: 'Fields name and email are required'
    });
  }

  const [result] = await pool.execute(
    'INSERT INTO users (name, email, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())',
    [name, email]
  );

  const [rows] = await pool.execute(
    'SELECT id, name, email, createdAt, updatedAt FROM users WHERE id = ?',
    [result.insertId]
  );

  res.status(201).json(rows[0]);
});

app.put('/sql/users/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { name, email } = req.body;

  const [existingRows] = await pool.execute(
    'SELECT id FROM users WHERE id = ?',
    [id]
  );

  if (existingRows.length === 0) {
    return res.status(404).json({
      message: 'User not found'
    });
  }

  await pool.execute(
    `UPDATE users
     SET name = COALESCE(?, name),
         email = COALESCE(?, email),
         updatedAt = NOW()
     WHERE id = ?`,
    [name ?? null, email ?? null, id]
  );

  const [rows] = await pool.execute(
    'SELECT id, name, email, createdAt, updatedAt FROM users WHERE id = ?',
    [id]
  );

  res.json(rows[0]);
});

app.delete('/sql/users/:id', async (req, res) => {
  const id = Number(req.params.id);

  const [existingRows] = await pool.execute(
    'SELECT id, name, email FROM users WHERE id = ?',
    [id]
  );

  if (existingRows.length === 0) {
    return res.status(404).json({
      message: 'User not found'
    });
  }

  await pool.execute('DELETE FROM users WHERE id = ?', [id]);

  res.json({
    message: 'User deleted successfully',
    user: existingRows[0]
  });
});

// --------------------
// Sequelize / ORM
// --------------------
app.get('/orm/users', async (req, res) => {
  const users = await User.findAll({
    include: [
      {
        model: Post,
        as: 'posts'
      }
    ],
    order: [['id', 'ASC']]
  });

  res.json(users);
});

app.post('/orm/users', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      message: 'Fields name and email are required'
    });
  }

  const user = await User.create({ name, email });
  res.status(201).json(user);
});

app.get('/orm/posts', async (req, res) => {
  const posts = await Post.findAll({
    include: [
      {
        model: User,
        as: 'user'
      }
    ],
    order: [['id', 'ASC']]
  });

  res.json(posts);
});

app.post('/orm/posts', async (req, res) => {
  const { title, content, userId } = req.body;

  if (!title || !content || !userId) {
    return res.status(400).json({
      message: 'Fields title, content and userId are required'
    });
  }

  const user = await User.findByPk(userId);

  if (!user) {
    return res.status(404).json({
      message: 'User not found'
    });
  }

  const post = await Post.create({
    title,
    content,
    userId
  });

  res.status(201).json(post);
});

app.get('/orm/users/:id/posts', async (req, res) => {
  const id = Number(req.params.id);

  const user = await User.findByPk(id, {
    include: [
      {
        model: Post,
        as: 'posts'
      }
    ]
  });

  if (!user) {
    return res.status(404).json({
      message: 'User not found'
    });
  }

  res.json(user);
});

// Common error handler
app.use((error, req, res, next) => {
  console.error(error);

  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      message: 'A user with this email already exists'
    });
  }

  res.status(500).json({
    message: 'Internal server error',
    error: error.message
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}

module.exports = app;
