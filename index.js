const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan'); // Logging middleware
const helmet = require('helmet'); // Security middleware
const rateLimit = require('express-rate-limit'); // Rate limiting middleware
const bodyParser = require('body-parser'); // For parsing JSON payloads
const NodeCache = require('node-cache'); // In-memory cache

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

// --- Optimizations ---

// In-memory cache with a 5-minute TTL (Time To Live)
const gameCache = new NodeCache({ stdTTL: 300, checkperiod: 320 }); // Automatically remove stale data

// Preload games into memory
let cachedGames = null;
fs.readFile(gamesFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error loading game data at startup:', err);
    process.exit(1); // Exit if the file can't be read
  }
  try {
    cachedGames = JSON.parse(data); // Parse game data and cache it
    console.log('Game data loaded into memory.');
  } catch (parseError) {
    console.error('Error parsing game data at startup:', parseError);
    process.exit(1); // Exit on invalid game data format
  }
});

// --- Endpoints ---

// Slot machine routes
app.use('/api/slotRoutes', slotRoutes);

// Endpoint to fetch and filter games with pagination
app.get('/api/games', (req, res, next) => {
    const searchQuery = (req.query.search || '').toLowerCase().trim(); // Normalize search query
    const page = parseInt(req.query.page, 10) || 1; // Get the page number from query, default to 1
    const limit = parseInt(req.query.limit, 10) || 10; // Get the items per page, default to 10
  
    // Check in-memory cache
    const cacheKey = `${searchQuery}-page${page}-limit${limit}`;
    if (gameCache.has(cacheKey)) {
      console.log('Cache hit for:', cacheKey);
      return res.json(gameCache.get(cacheKey)); // Return cached result
    }
  
    try {
      // Use in-memory preloaded games
      const games = cachedGames;
  
      // Filter games based on the search query
      const filteredGames = searchQuery
        ? games.filter((game) =>
            game.title && game.title.toLowerCase().includes(searchQuery)
          )
        : games;
  
      // Pagination logic
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedGames = filteredGames.slice(startIndex, endIndex);
  
      // Cache the paginated result
      gameCache.set(cacheKey, {
        total: filteredGames.length, // Total number of filtered items
        page,
        limit,
        paginatedGames,
      });
  
      // Return paginated and filtered results
      res.status(200).json({
        total: filteredGames.length, // Total number of filtered items
        page,
        limit,
        paginatedGames,
      });
    } catch (error) {
      console.error('Error processing games:', error);
      next(error); // Pass the error to the error-handling middleware
    }
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
