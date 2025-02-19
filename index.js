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
  try {
    const { time_string, email } = req.body;
    if (!time_string?.trim()) return res.status(400).json({ error: 'Missing time_string' });
    if (!email?.trim()) return res.status(400).json({ error: 'Missing email' });

    // Parse the date
    const referenceDate = new Date();
    let parsedDate = chrono.parseDate(time_string.trim(), referenceDate, { forwardDate: true });

    if (!parsedDate) return res.status(400).json({ error: 'Invalid time string' });

    // Ensure the date is in the future
    const now = new Date();
    if (parsedDate < now) {
      parsedDate.setDate(parsedDate.getDate() + 7);
    }

    const formattedDate = formatLocalISO(parsedDate);

    // Send to webhook
    const webhookResponse = await axios.post(WEBHOOK_URL, { datetime: formattedDate, email });

    console.log('Webhook Response:', webhookResponse.data);

    res.json({ message: 'Date sent successfully', datetime: formattedDate });
  } catch (error) {
    console.error('Server Error:', error.message, error.response?.data);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Listen only when running locally (not required for Vercel serverless)
if (process.env.NODE_ENV !== 'vercel') {
  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
}

module.exports = app; // Required for Vercel
