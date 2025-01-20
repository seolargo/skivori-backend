const express = require('express');
const router = express.Router();

// Initial user balance
let userBalance = 20;

// Slot machine reels
const reels = [
  ["cherry", "lemon", "apple", "lemon", "banana", "banana", "lemon", "lemon"],
  ["lemon", "apple", "lemon", "lemon", "cherry", "apple", "banana", "lemon"],
  ["lemon", "apple", "lemon", "apple", "cherry", "lemon", "banana", "lemon"]
];

// Rewards
const rewards = {
  "3cherry": 50,
  "2cherry": 40,
  "3apple": 20,
  "2apple": 10,
  "3banana": 15,
  "2banana": 5,
  "3lemon": 3,
};

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
router.post('/spin', (req, res) => {
  if (userBalance <= 0) {
    return res.status(400).json({ error: "Insufficient balance to spin!" });
  }

  // Deduct spin cost
  userBalance -= 1;

  // Spin the reels
  const spinResult = spinReels();

  // Calculate reward
  const reward = calculateReward(spinResult);

  // Update balance
  userBalance += reward;

  // Respond with the spin result and updated balance
  res.json({
    spinResult,
    reward,
    updatedBalance: userBalance,
  });
});

module.exports = router;
