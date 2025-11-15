const express = require('express');
const db = require('../database');
const router = express.Router();

// Get all readings
router.get('/readings', (req, res) => {
  db.all('SELECT * FROM readings ORDER BY timestamp DESC', [], (err, rows) => {
    if (err) return res.status(500).send('DB error');
    res.json(rows);
  });
});

// Get latest reading
router.get('/latest', (req, res) => {
  db.get('SELECT * FROM readings ORDER BY timestamp DESC LIMIT 1', [], (err, row) => {
    if (err) return res.status(500).send('DB error');
    res.json(row);
  });
});

module.exports = router;