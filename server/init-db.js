const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'smartlingo.db');
const db = new sqlite3.Database(dbPath);

// create tables
const createUsers = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT
);
`;

const createMeetings = `
CREATE TABLE IF NOT EXISTS meetings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  start_time TEXT,
  end_time TEXT
);
`;

const createCaptions = `
CREATE TABLE IF NOT EXISTS captions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  meeting_id INTEGER NOT NULL,
  speaker TEXT,
  text TEXT,
  timestamp TEXT,
  FOREIGN KEY(meeting_id) REFERENCES meetings(id)
);
`;

const createTranslations = `
CREATE TABLE IF NOT EXISTS translations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  caption_id INTEGER NOT NULL,
  language TEXT NOT NULL,
  text TEXT,
  FOREIGN KEY(caption_id) REFERENCES captions(id)
);
`;

const statements = [createUsers, createMeetings, createCaptions, createTranslations];

db.serialize(() => {
  statements.forEach((stmt) => {
    db.run(stmt, (err) => {
      if (err) {
        console.error('Error creating table', err);
      }
    });
  });
});

console.log('Database initialized');

// close database
db.close();
