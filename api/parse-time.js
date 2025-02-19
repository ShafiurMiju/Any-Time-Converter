const express = require('express');
const chrono = require('chrono-node');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/dCJtUsUCwtScv4BfRCHf/webhook-trigger/cdf560a1-037d-4c19-8d0d-386928f7e512';

function formatLocalISO(date) {
  const pad = (num) => num.toString().padStart(2, '0');
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()} ` +
         `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

app.post('/parse-time', async (req, res) => {
  const { time_string, email } = req.body;
  if (!time_string?.trim()) return res.status(400).json({ error: 'Missing time_string' });
  if (!email?.trim()) return res.status(400).json({ error: 'Missing email' });

  // Parse with explicit reference time and future preference
  const referenceDate = new Date();
  let parsedDate = chrono.parseDate(time_string.trim(), referenceDate, { forwardDate: true });

  if (!parsedDate) return res.status(400).json({ error: 'Invalid time string' });

  // Ensure the result is in the future
  const now = new Date();
  if (parsedDate < now) {
    parsedDate.setDate(parsedDate.getDate() + 7);
  }

  const formattedDate = formatLocalISO(parsedDate);

  try {
    // Send datetime and email to webhook
    await axios.post(WEBHOOK_URL, { datetime: formattedDate, email });

    // Respond to API call without email
    res.json({ message: 'Date sent successfully', email: email, datetime: formattedDate });
  } catch (error) {
    console.error('Error sending to webhook:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to send data to webhook' });
  }
});

// Vercel Serverless Handler
module.exports = (req, res) => {
  app(req, res);  // Handles both HTTP GET and POST requests
};
