const express = require('express');
const morgan = require('morgan'); // Logging middleware
const rateLimit = require('express-rate-limit'); // Rate limiting middleware
const helmet = require('helmet'); // Security middleware
const bodyParser = require('body-parser'); // For parsing JSON payloads

const router = express.Router();

const app = express();

// Initial user balance
let userBalance = 20;

// Slot machine reels and rewards
const reels = [
  ["cherry", "lemon", "apple", "lemon", "banana", "banana", "lemon", "lemon"],
  ["lemon", "apple", "lemon", "lemon", "cherry", "apple", "banana", "lemon"],
  ["lemon", "apple", "lemon", "apple", "cherry", "lemon", "banana", "lemon"]
];

const rewards = {
  "3cherry": 50,
  "2cherry": 40,
  "3apple": 20,
  "2apple": 10,
  "3banana": 15,
  "2banana": 5,
  "3lemon": 3
};

// Middleware for logging
app.use(morgan('tiny')); // Logs every request (method, URL, response time, etc.)

// Middleware for security
app.use(helmet()); // Adds HTTP headers for security (e.g., prevents XSS and clickjacking)

// Middleware for rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Too many requests. Please try again later.' }
});
app.use(limiter);

// Middleware for parsing JSON payloads
app.use(bodyParser.json()); // Parses incoming JSON requests

// Middleware for validating the player's balance
const validateBalance = (req, res, next) => {
  if (userBalance <= 0) {
    return res.status(400).json({ error: 'Insufficient balance to spin!' });
  }
  next(); // Proceed to the next middleware or route handler
};

// Middleware for error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong. Please try again later.' });
});

// Helper function to spin the reels
const spinReels = () => {
  return reels.map(reel => reel[Math.floor(Math.random() * reel.length)]);
};

// Helper function to calculate rewards
const calculateReward = (result) => {
  let reward = 0;

  // Check for 3-in-a-row
  if (result[0] === result[1] && result[1] === result[2]) {
    reward = rewards[`3${result[0]}`] || 0;
  }
  // Check for 2-in-a-row
  else if (result[0] === result[1]) {
    reward = rewards[`2${result[0]}`] || 0;
  }

  return reward;
};

// Slot machine endpoint
router.post('/api/spin', validateBalance, (req, res) => {
  // Deduct 1 coin for the spin
  userBalance--;

  // Spin the reels
  const spinResult = spinReels();

  // Calculate reward
  const reward = calculateReward(spinResult);

  // Update balance with the reward
  userBalance += reward;

  // Respond with the spin result and updated balance
  res.json({
    spinResult,
    reward,
    updatedBalance: userBalance
  });
});

module.exports = router;
