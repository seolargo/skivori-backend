# Online Casino Platform Schema

## Problem Statement

> You are working on an online casino platform. A casino has games. Each game has a unique type. Each game is available in one or more countries where players are allowed to play. A player may or may not have a favourite game. Every spin on any game should be recorded, including the amount of money won or lost.

## Schema Overview

### 1. Entities
- **Casino**: Represents the platform or organization.
- **Games**: Represents individual games offered by the casino.
- **Countries**: Represents the countries where games are available.
- **Players**: Represents the individuals who play the games.
- **Spins**: Represents every spin or play action a player performs on a game.

### 2. Attributes

#### Casino
- **casino_id**: A unique identifier for the casino.
- **casino_name**: The name of the casino.

#### Games
- **game_id**: A unique identifier for each game.
- **game_name**: The name of the game (e.g., Poker, Roulette).
- **game_type**: The type/category of the game (e.g., Card, Slot).

#### Countries
- **country_id**: A unique identifier for the country.
- **country_code**: A short code for the country (e.g., US, UK).
- **country_name**: The full name of the country.

#### Players
- **player_id**: A unique identifier for each player.
- **player_name**: The name of the player.
- **favorite_game_id**: A reference to their favorite game (optional).

#### Spins
- **spin_id**: A unique identifier for each spin.
- **player_id**: A reference to the player who made the spin.
- **game_id**: A reference to the game played in the spin.
- **spin_timestamp**: The date and time when the spin occurred.
- **amount_won_or_lost**: The amount of money won or lost in the spin.

### 3. Relationships
- **Casino ↔ Games**: One casino has many games. (one-to-many relationship)
- **Games ↔ Countries**: A game can be available in multiple countries (many-to-many relationship).
- **Players ↔ Games**: A player may or may not have one favorite game. (optional one-to-one relationship).
- **Players ↔ Spins**: A player can make multiple spins, but each spin is associated with one player. (one-to-many relationship)
- **Games ↔ Spins**: A game can have multiple spins, but each spin is tied to one game. (one-to-many relationship).

### 4. Constraints
- **Game Dependency**:
  - A game cannot exist without a casino (`casino_id` as a foreign key in Games).
- **Spin Validity**:
  - A spin must always reference a valid player and game (`player_id` and `game_id` as foreign keys in Spins).
- **Favorite Games**:
  - Favorite games for players must reference existing games (`favorite_game_id` in Players referencing Games).

## Explanation of the Schema

### 1. **Games Table**
- Tracks unique games (`game_id`).
- Stores game name and type.

### 2. **Countries Table**
- Tracks unique countries (`country_id`).
- Stores the country code and name.

### 3. **Game_Countries Table**
- Represents the many-to-many relationship between games and countries.
- Each game can be available in multiple countries, and each country can allow multiple games.

### 4. **Players Table**
- Tracks unique players (`player_id`).
- Optionally links a favorite game (`favorite_game_id`) for each player.

### 5. **Spins Table**
- Logs each spin with details: player, game, timestamp, and outcome.

## SQL Table Creations

### **Casino Table**
```sql
CREATE TABLE Casino (
    casino_id SERIAL PRIMARY KEY,
    casino_name VARCHAR(255) NOT NULL
);
ALTER TABLE Games
ADD COLUMN casino_id INT NOT NULL,
ADD FOREIGN KEY (casino_id) REFERENCES Casino(casino_id) ON DELETE CASCADE;
```

### **Games Table**
```sql
CREATE TABLE Games (
    game_id SERIAL PRIMARY KEY,
    game_name VARCHAR(255) NOT NULL,
    game_type VARCHAR(100) NOT NULL
);
```

### **Countries Table**
```sql
CREATE TABLE Countries (
    country_id SERIAL PRIMARY KEY,
    country_code CHAR(2) NOT NULL UNIQUE,
    country_name VARCHAR(255) NOT NULL
);
```

### **Game_Countries Table**
```sql
CREATE TABLE Game_Countries (
    game_id INT NOT NULL,
    country_id INT NOT NULL,
    PRIMARY KEY (game_id, country_id),
    FOREIGN KEY (game_id) REFERENCES Games(game_id) ON DELETE CASCADE,
    FOREIGN KEY (country_id) REFERENCES Countries(country_id) ON DELETE CASCADE
);
```

### **Players Table**
```sql
CREATE TABLE Players (
    player_id SERIAL PRIMARY KEY,
    player_name VARCHAR(255) NOT NULL,
    favorite_game_id INT,
    FOREIGN KEY (favorite_game_id) REFERENCES Games(game_id) ON DELETE SET NULL
);
```

### **Spins Table**
```sql
CREATE TABLE Spins (
    spin_id SERIAL PRIMARY KEY,
    player_id INT NOT NULL,
    game_id INT NOT NULL,
    spin_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount_won_or_lost NUMERIC(10, 2) NOT NULL,
    FOREIGN KEY (player_id) REFERENCES Players(player_id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES Games(game_id) ON DELETE CASCADE
);
```

### Enhancements

#### Adding Currency Support
```sql
CREATE TABLE Currencies (
    currency_code CHAR(3) PRIMARY KEY, -- e.g., USD, GBP
    currency_name VARCHAR(50) NOT NULL
);
ALTER TABLE Countries
ADD COLUMN currency_code CHAR(3) NOT NULL,
ADD FOREIGN KEY (currency_code) REFERENCES Currencies(currency_code);
```

#### Adding Constraints for Spins
```sql
ALTER TABLE Spins
ADD CONSTRAINT chk_amount_nonzero CHECK (amount_won_or_lost != 0);
ALTER TABLE Spins
ADD COLUMN spin_type VARCHAR(20) DEFAULT 'real_money' CHECK (spin_type IN ('real_money', 'free_spin'));
```

#### Adding Indexes
```sql
CREATE INDEX idx_game_id ON Spins(game_id);
CREATE INDEX idx_player_id ON Spins(player_id);
CREATE INDEX idx_country_id ON Game_Countries(country_id);
```

## Sample Data Insertion

### Insert Games
```sql
INSERT INTO Games (game_name, game_type)
VALUES
    ('Poker', 'Card'),
    ('Slot Machine', 'Slot');
```

### Insert Countries
```sql
INSERT INTO Countries (country_code, country_name)
VALUES
    ('US', 'United States'),
    ('GB', 'United Kingdom');
```

### Associate Games with Countries
```sql
INSERT INTO Game_Countries (game_id, country_id)
VALUES
    (1, 1),
    (2, 2);
```

### Insert Players
```sql
INSERT INTO Players (player_name, favorite_game_id)
VALUES
    ('Alice', 1),
    ('Bob', NULL);
```

### Insert Spins
```sql
INSERT INTO Spins (player_id, game_id, amount_won_or_lost)
VALUES
    (1, 1, 100.00),
    (1, 2, -50.00),
    (2, 2, 200.00),
    (2, 3, -20.00);
```

## Justification for Surrogate Keys

I assume we will mostly work with large datasets. We have used numerical IDs like 1, 2, etc., for `country_id` instead of directly using codes like "UK", "US", etc., because it is a common database design choice often implemented.

### Benefits of Surrogate Keys
- **Efficiency**: Numeric values are smaller and faster to index and search compared to text-based keys.
- **Stability**: If a country's code changes (e.g., UK changes to GB due to political reasons), the numeric ID (`country_id`) remains unchanged. Only the `country_code` field in the `Countries` table needs to be updated.
- **Uniformity**: Using numerical IDs ensures uniformity and avoids potential issues with case sensitivity or encoding in text keys like "UK", "us", or "Us".

For small datasets, using "UK" or "US" directly would improve readability and reduce the need for a surrogate `country_id`. However, for large datasets, surrogate keys are more efficient and scalable.

## Test Queries

### Get All Spins with Details
```sql
SELECT
    s.spin_id,
    p.player_name,
    g.game_name,
    s.amount_won_or_lost,
    s.spin_timestamp
FROM Spins s
JOIN Players p ON s.player_id = p.player_id
JOIN Games g ON s.game_id = g.game_id;
```

### Outcome
| spin_id | player_name | game_name    | amount_won_or_lost | spin_timestamp       |
|---------|-------------|--------------|--------------------|----------------------|
| 1       | Alice       | Poker        | 100.00             | 2025-01-21 02:33:23 |
| 2       | Bob         | Slot Machine | -20.00             | 2025-01-21 02:33:23 |

### Get Favorite Games of a Player
```sql
SELECT
    g.game_name
FROM Games g
JOIN Player_Favorite_Games pfg ON g.game_id = pfg.game_id
WHERE pfg.player_id = 1;
```

### Check Favorite Games
```sql
SELECT
    player_name,
    CASE
        WHEN favorite_game_id IS NULL THEN 'No favorite game'
        ELSE 'Has a favorite game'
    END AS favorite_status
FROM Players;
```

### Outcome
| player_name | favorite_status     |
|-------------|---------------------|
| Alice       | Has a favorite game |
| Bob         | No favorite game    |



