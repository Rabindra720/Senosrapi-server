// const express = require('express');
// const bodyParser = require('body-parser');
// const db = require('./database');
// const WebSocket = require('ws');
// const apiRoutes = require('./routes/api');

// const app = express();
// const PORT = 3000;

// app.use(bodyParser.json());
// app.use('/api', apiRoutes);
// app.use(express.static('public'));

// // Webhook to receive sensor data
// app.post('/webhook', (req, res) => {
//   const { temperature, humidity } = req.body;

//   db.run(
//     'INSERT INTO readings (temperature, humidity) VALUES (?, ?)',
//     [temperature, humidity],
//     (err) => {
//       if (err) return res.status(500).send('DB error');
//       broadcast({ temperature, humidity });
//       res.status(200).send('Data received');
//     }
//   );
// });

// // Start HTTP server
// const server = app.listen(PORT, () => {
//   console.log(`Server running at http://192.168.56.1:${PORT}`);
// });

// // WebSocket setup
// const wss = new WebSocket.Server({ server });

// function broadcast(data) {
//   const message = JSON.stringify(data);
//   wss.clients.forEach((client) => {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(message);
//     }
//   });
// }


const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Create or connect to SQLite database
const db = new sqlite3.Database('./data.db');
db.run(`CREATE TABLE IF NOT EXISTS readings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  temperature REAL,
  humidity REAL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.get('/api/readings', (req, res) => {
  db.all('SELECT * FROM readings ORDER BY timestamp DESC', [], (err, rows) => {
    if (err) return res.status(500).send('DB error');
    res.json(rows);
  });
});

app.get('/api/latest', (req, res) => {
  db.get('SELECT * FROM readings ORDER BY timestamp DESC LIMIT 1', [], (err, row) => {
    if (err) return res.status(500).send('DB error');
    res.json(row || {}); // ✅ Always return valid JSON
  });
});

// Webhook route
app.post('/webhook', (req, res) => {
  const { temperature, humidity } = req.body;
  console.log("Incoming payload:", req.body);

  db.run(
    'INSERT INTO readings (temperature, humidity) VALUES (?, ?)',
    [temperature, humidity],
    (err) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).send('DB error');
      }
      console.log("Inserted into DB:", { temperature, humidity });
      broadcast({ temperature, humidity });
      res.status(200).send('Data received');
    }
  );
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// WebSocket setup
const wss = new WebSocket.Server({ server });

wss.on('connection', (socket) => {
  console.log("WebSocket client connected");
});

function broadcast(data) {
  const message = JSON.stringify(data);
  console.log("Broadcasting:", message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}