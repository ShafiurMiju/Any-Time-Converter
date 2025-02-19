const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(bodyParser.json());

// Basic route to test
app.get('/', (req, res) => {
  res.send('Welcome to the Time Parser API! Use /api/parse-time to parse times.');
});

// You can define other routes here as needed
app.post('/api/parse-time', (req, res) => {
  const { time_string, email } = req.body;
  if (!time_string || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  res.json({ message: `Received time: ${time_string} and email: ${email}` });
});

// Vercel Serverless Handler
module.exports = (req, res) => {
  app(req, res);  // Forward the request to the Express app
};
