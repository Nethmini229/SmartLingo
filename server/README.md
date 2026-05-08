# SmartLingo Backend

This directory contains a simple Node.js + Express backend with SQLite for the SmartLingo UI.

## Setup

1. Open a terminal and navigate to the `server` folder:
   ```bash
   cd "c:\Users\Dhanuka Ravishan\Desktop\Nethmini\3rd Year Final Project\SmartLingo UI\SmartLingo\server"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the database (creates `smartlingo.db` with the required tables):
   ```bash
   npm run init-db
   ```
4. Start the server:
   ```bash
   npm start
   ```

The server listens on port `3000` by default and exposes a `/ping` endpoint to verify it's running.

## API Endpoints (examples)

### Users
```bash
# register
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret","email":"alice@example.com"}'

# login
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret"}'
```

### Meetings
```bash
# list
curl http://localhost:3000/meetings

# create
curl -X POST http://localhost:3000/meetings \
  -H "Content-Type: application/json" \
  -d '{"title":"Team Chat","description":"Weekly sync","start_time":"2026-03-01T09:00","end_time":"2026-03-01T10:00"}'
```

### Captions
```bash
# get captions for meeting 1
curl http://localhost:3000/meetings/1/captions

# add caption
curl -X POST http://localhost:3000/meetings/1/captions \
  -H "Content-Type: application/json" \
  -d '{"speaker":"Bob","text":"Hello","timestamp":"00:00:05"}'
```

### Translations
```bash
# get translations for caption 1
curl http://localhost:3000/captions/1/translations

# add translation
curl -X POST http://localhost:3000/captions/1/translations \
  -H "Content-Type: application/json" \
  -d '{"language":"es","text":"Hola"}'
```

## Extending the API

The routes above are a starting point; you can modify or add new ones in `server.js` as your app grows. In the frontend, make `fetch` requests to these endpoints from your HTML/JS files (e.g. `Login.js`, `Meeting.js`, etc.).

