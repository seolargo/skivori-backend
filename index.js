const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan'); // Logging middleware
const helmet = require('helmet'); // Security middleware
const rateLimit = require('express-rate-limit'); // Rate limiting middleware
const bodyParser = require('body-parser'); // For parsing JSON payloads

const app = express();
const PORT = 3001;
const slotRoutes = require('./routes');

// File path for game data
const gamesFilePath = path.join(__dirname, 'mocks', 'game-data.json');

// --- Middleware ---

// Security middleware
app.use(helmet()); // Adds HTTP headers to improve security

// CORS middleware
app.use(cors()); // Enables cross-origin resource sharing

// Logging middleware
app.use(morgan('tiny')); // Logs HTTP requests

// JSON parsing middleware
app.use(bodyParser.json()); // Parses JSON payloads

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per IP in 15 minutes
  message: { error: 'Too many requests. Please try again later.' },
});
app.use(limiter); // Apply rate limiting

// --- Endpoints ---

// Slot machine routes
app.use('/api/slotRoutes', slotRoutes);

// Endpoint to fetch and filter games
app.get('/api/games', (req, res, next) => {
  const searchQuery = req.query.search || ''; // Get the search query

  fs.readFile(gamesFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading game data:', err);
      return res.status(500).json({ error: 'Failed to load game data.' });
    }

    try {
      const games = JSON.parse(data);

      // Filter games based on the search query
      const filteredGames = searchQuery
        ? games.filter((game) =>
            game.title &&
            game.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
          )
        : games;

      // Return all games and the filtered games
      return res.status(200).json({ allGames: games, filteredGames });
    } catch (parseError) {
      console.error('Error parsing game data:', parseError);
      next(parseError); // Pass the error to the global error handler
    }
  });
});

// --- Error Handling Middleware ---
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack
  res.status(500).json({ error: 'Something went wrong. Please try again later.' });
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
