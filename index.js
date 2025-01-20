const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 3001;
const slotRoutes = require('./routes');

app.use(cors());
app.use(express.json());

app.use('/api/slotRoutes', slotRoutes);

const gamesFilePath = path.join(__dirname, 'mocks', 'game-data.json');

// Endpoint to fetch and filter games
app.get('/api/games', (req, res) => {
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
            return res.status(500).json({ error: 'Invalid game data format.' });
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
