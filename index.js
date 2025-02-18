
const express = require('express');
const chrono = require('chrono-node');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

function formatLocalISO(date) {
  const pad = (num) => num.toString().padStart(2, '0');
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()} ` +
         `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

app.post('/parse-time', (req, res) => {
  const timeString = req.body.time_string?.trim();
  if (!timeString) return res.status(400).json({ error: 'Missing time_string' });

  // Parse with explicit reference time and future preference
  const referenceDate = new Date(); // Use current server time as reference
  const parsedDate = chrono.parseDate(timeString, referenceDate, { forwardDate: true });

  if (!parsedDate) return res.status(400).json({ error: 'Invalid time string' });

  // Ensure the result is in the future
  const now = new Date();
  if (parsedDate < now) {
    // Handle cases like "Monday 4pm" when today is Monday but after 4pm
    parsedDate.setDate(parsedDate.getDate() + 7);
  }

  res.json({ datetime: formatLocalISO(parsedDate) });
});

app.listen(3000, () => {
  console.log('Server running');
});
