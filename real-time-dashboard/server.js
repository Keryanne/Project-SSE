const express = require('express');
const os = require('os-utils');
const path = require('path');
const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Servir le fichier index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendStats = () => {
    os.cpuUsage((cpuUsage) => {
      const stats = {
        cpuUsage: (cpuUsage * 100).toFixed(2),
        freeMemory: os.freemem(),
        totalMemory: os.totalmem(),
        freeMemoryPercentage: (os.freememPercentage() * 100).toFixed(2)
      };
      res.write(`data: ${JSON.stringify(stats)}\n\n`);
    });
  };

  const intervalId = setInterval(sendStats, 1000);

  req.on('close', () => {
    clearInterval(intervalId);
    res.end();
  });

  sendStats();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
