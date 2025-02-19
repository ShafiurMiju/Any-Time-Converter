const express = require('express');
const app = express();

// Add more routes or middlewares here
app.get('/', (req, res) => {
  res.send('Welcome to the Time Parser API! Use /api/parse-time to parse times.');
});

// Your other routes or middleware go here...

module.exports = (req, res) => {
  app(req, res);  // Forward requests to the Express app
};
