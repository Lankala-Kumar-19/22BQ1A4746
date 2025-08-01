

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4000;


app.use(cors());
app.use(express.json()); 

const LOG_FILE = path.join(__dirname, 'logs.json');


function saveLog(logEntry) {
  let logs = [];
  try {
    const data = fs.readFileSync(LOG_FILE, 'utf8');
    logs = JSON.parse(data);
  } catch (err) {
    
  }
  logs.push(logEntry);
  fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
}


app.post('/api/logs', (req, res) => {
  const logData = req.body;

  if (!logData.stack || !logData.level || !logData.package || !logData.message) {
    return res.status(400).json({ error: 'Missing required log fields' });
  }

 
  const logEntry = {
    ...logData,
    receivedAt: new Date().toISOString()
  };

  saveLog(logEntry);

  console.log('Received log:', logEntry);

  res.status(200).json({ message: 'Log saved successfully' });
});

app.listen(PORT, () => {
  console.log(`Logging Middleware server listening on http://localhost:${PORT}`);
});
