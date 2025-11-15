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
const db = require('./database');
const WebSocket = require('ws');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/api', apiRoutes);
app.use(express.static('public'));

app.post('/webhook', (req, res) => {
  const { temperature, humidity } = req.body;

  db.run(
    'INSERT INTO readings (temperature, humidity) VALUES (?, ?)',
    [temperature, humidity],
    (err) => {
      if (err) return res.status(500).send('DB error');
      broadcast({ temperature, humidity });
      res.status(200).send('Data received');
    }
  );
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const wss = new WebSocket.Server({ server });

function broadcast(data) {
  const message = JSON.stringify(data);
  console.log("Broadcasting:", message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}