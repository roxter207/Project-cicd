require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

app.get('/', async (req, res) => {
  try {
    const todos = await pool.query('SELECT * FROM todos ORDER BY id DESC');
    const todoList = todos.rows.map(todo => `
      <li>
        ${todo.task}
        <form method="POST" action="/delete" style="display:inline;">
          <input type="hidden" name="id" value="${todo.id}" />
          <button type="submit">🗑️</button>
        </form>
      </li>
    `).join('');

    res.send(`
      <h2>📝 My Todo List</h2>
      <form method="POST" action="/add">
        <input name="task" required placeholder="Enter a task" />
        <button type="submit">Add</button>
      </form>
      <ul>${todoList}</ul>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database connection error');
  }
});

app.post('/add', async (req, res) => {
  try {
    const { task } = req.body;
    if (task.trim() !== '') {
      await pool.query('INSERT INTO todos (task) VALUES ($1)', [task]);
    }
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to add task');
  }
});

app.post('/delete', async (req, res) => {
  try {
    const { id } = req.body;
    await pool.query('DELETE FROM todos WHERE id = $1', [id]);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to delete task');
  }
});

module.exports = app;
