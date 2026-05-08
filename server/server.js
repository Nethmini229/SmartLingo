const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const FormData = require('form-data');
const fetch = require('node-fetch');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..')));

// database
const dbPath = path.join(__dirname, 'smartlingo.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to database', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS corrections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  original_text TEXT NOT NULL,
  wrong_translation TEXT,
  correct_translation TEXT NOT NULL,
  language TEXT,
  created_at TEXT DEFAULT (datetime('now'))
)`);
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS meetings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    start_time TEXT,
    end_time TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS captions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id INTEGER,
    speaker TEXT,
    text TEXT,
    timestamp TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    caption_id INTEGER,
    language TEXT,
    text TEXT
  )`);
});

// simple test endpoint
app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// --- user routes ------------------------------------------------
app.post('/users/register', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password required' });
  }
  const stmt = `INSERT INTO users (email, password, name) VALUES (?, ?, ?)`;
  db.run(stmt, [email, password, name || null], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, email, name });
  });
});

app.post('/users/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password required' });
  }
  db.get(`SELECT * FROM users WHERE email = ? AND password = ?`, [email, password], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(401).json({ error: 'invalid credentials' });
    }
    res.json({ id: row.id, email: row.email, name: row.name });
  });
});

// --- meeting routes ------------------------------------------------
app.get('/meetings', (req, res) => {
  db.all(`SELECT * FROM meetings`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/meetings', (req, res) => {
  const { title, description, start_time, end_time } = req.body;
  const stmt = `INSERT INTO meetings (title, description, start_time, end_time) VALUES (?, ?, ?, ?)`;
  db.run(stmt, [title, description, start_time, end_time], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, title, description, start_time, end_time });
  });
});

// --- caption routes ------------------------------------------------
app.get('/meetings/:id/captions', (req, res) => {
  const meetingId = req.params.id;
  db.all(`SELECT * FROM captions WHERE meeting_id = ?`, [meetingId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/meetings/:id/captions', (req, res) => {
  const meetingId = req.params.id;
  const { speaker, text, timestamp } = req.body;
  const stmt = `INSERT INTO captions (meeting_id, speaker, text, timestamp) VALUES (?, ?, ?, ?)`;
  db.run(stmt, [meetingId, speaker, text, timestamp], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, meeting_id: meetingId, speaker, text, timestamp });
  });
});

// --- translation routes --------------------------------------------
app.get('/captions/:id/translations', (req, res) => {
  const captionId = req.params.id;
  db.all(`SELECT * FROM translations WHERE caption_id = ?`, [captionId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/captions/:id/translations', (req, res) => {
  const captionId = req.params.id;
  const { language, text } = req.body;
  const stmt = `INSERT INTO translations (caption_id, language, text) VALUES (?, ?, ?)`;
  db.run(stmt, [captionId, language, text], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, caption_id: captionId, language, text });
  });
});

// settings stub
app.post('/settings', (req, res) => {
  console.log('received settings', req.body);
  res.json({ status: 'ok' });
});

// --- speech recognition route ------------------------------------
const upload = multer({ dest: 'uploads/' });

app.post('/speech/recognize', upload.single('audio'), async (req, res) => {
  console.log('---SPEECH REQUEST RECEIVED---');
  console.log('File info:', req.file);
  try {
    const formData = new FormData();
    formData.append('audio', fs.createReadStream(req.file.path));
    console.log('Sending to Vosk...');
    const response = await fetch('http://127.0.0.1:5001/recognize', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    console.log('Vosk response status:', response.status);
    const result = await response.json();
    fs.unlinkSync(req.file.path);
    res.json(result);
  } catch (err) {
    console.error('Speech recognition error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- MyMemory translation route ------------------------------------
app.post('/translate', async (req, res) => {
  const { text, langPair } = req.body;
  if (!text || !langPair) {
    return res.status(400).json({ error: 'text and langPair required' });
  }
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json({ translatedText: data.responseData.translatedText });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Save a correction
app.post('/corrections', (req, res) => {
  const { original_text, wrong_translation, correct_translation, language } = req.body;
  db.run(
    `INSERT INTO corrections (original_text, wrong_translation, correct_translation, language) VALUES (?, ?, ?, ?)`,
    [original_text, wrong_translation, correct_translation, language],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Get recent corrections for a language
app.get('/corrections/:language', (req, res) => {
  db.all(
    `SELECT * FROM corrections WHERE language = ? ORDER BY created_at DESC LIMIT 10`,
    [req.params.language],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});
// start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});