require('dotenv').config(); // 🔼 Load environment variables
const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send('Welcome to our simple CICD project');
    res.send(`Database time: ${result.rows[0].now}`);
  } catch (err) {
    console.error(err); // 🔴 Helpful for debugging
    res.status(500).send('Database connection error');
  }
});

module.exports = app;
