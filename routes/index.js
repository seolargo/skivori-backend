const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Mock data for games
const games = [
    {
        id: 1,
        name: 'Game 1',
        thumb: { url: 'https://via.placeholder.com/150' },
    },
    {
        id: 2,
        name: 'Game 2',
        thumb: { url: 'https://via.placeholder.com/150' },
    },
    {
        id: 3,
        name: 'Game 3',
        thumb: { url: 'https://via.placeholder.com/150' },
    },
];

// API endpoint to fetch games
app.get('/api/games', (req, res) => {
    res.json(games);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
