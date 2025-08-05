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
  <html>
    <head>
      <title>My Todo List</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #ff00cc, #3333ff, #00ffcc, #ffcc00);
          background-size: 400% 400%;
          animation: gradientBG 15s ease infinite;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          color: white;
        }

        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .container {
          background-color: rgba(0, 0, 0, 0.6);
          padding: 2rem;
          border-radius: 15px;
          width: 100%;
          max-width: 500px;
          text-align: center;
          box-shadow: 0 8px 16px rgba(0,0,0,0.3);
        }

        h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        form {
          margin-bottom: 1.5rem;
        }

        input {
          padding: 0.5rem;
          width: 70%;
          border-radius: 5px;
          border: none;
          margin-right: 0.5rem;
        }

        button {
          padding: 0.5rem 1rem;
          background-color: #00ffff;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s;
        }

        button:hover {
          background-color: #ff00ff;
        }

        ul {
          list-style-type: none;
          padding: 0;
        }

        li {
          margin-bottom: 0.75rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.1);
          padding: 0.5rem 1rem;
          border-radius: 8px;
        }

        li form {
          margin: 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>📝 My Todo </h2>
        <form method="POST" action="/add">
          <input name="task" required placeholder="Enter a task" />
          <button type="submit">Add</button>
        </form>
        <ul>${todoList}</ul>
      </div>
    </body>
  </html>
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
