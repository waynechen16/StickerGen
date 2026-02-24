import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const LOG_DIR = path.join(__dirname, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'usage.log');

app.use(cors());
app.use(express.json());

// Ensure the logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// POST endpoint to log usage
app.post('/api/log-usage', (req, res) => {
  const { action, details } = req.body;
  
  // Format the timestamp nicely for local reading
  const date = new Date();
  const timestamp = date.toLocaleString('zh-TW', { timeZoneName: 'short' });
  
  const logEntry = `[${timestamp}] Action: ${action} | Details: ${JSON.stringify(details || {})}\n`;
  
  fs.appendFile(LOG_FILE, logEntry, (err) => {
    if (err) {
      console.error('Failed to write to log file', err);
      return res.status(500).json({ status: 'error', message: 'Failed to write log' });
    }
    
    // Read the total number of lines to report back the counter
    fs.readFile(LOG_FILE, 'utf8', (readErr, data) => {
      let count = 0;
      if (!readErr) {
        count = data.split('\n').filter(line => line.trim() !== '').length;
      }
      res.json({ status: 'success', totalUses: count, message: `Logged successfully. Total uses: ${count}` });
    });
  });
});

app.listen(PORT, () => {
  console.log(`[StickerGen Logger] Backend server running on http://localhost:${PORT}`);
  console.log(`[StickerGen Logger] Logs will be saved to ${LOG_FILE}`);
});
