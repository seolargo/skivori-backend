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
  
  // Simulation for 50 spins
  const simulateSpins = (numSpins, startingBalance) => {
    let balance = startingBalance;
  
    console.log('--- Slot Machine Simulation Start ---\n');
  
    for (let i = 1; i <= numSpins; i++) {
      // Deduct 1 coin for the spin
      balance--;
  
      // Spin the reels
      const spinResult = spinReels();
  
      // Calculate reward
      const reward = calculateReward(spinResult);
  
      // Update balance with the reward
      balance += reward;
  
      // Log the spin result, reward, and balance
      console.log(`Spin #${i}:`);
      console.log(`Result: ${spinResult.join(' | ')}`);
      console.log(`Reward: ${reward} coins`);
      console.log(`Balance: ${balance} coins`);
      console.log('------------------------------');
  
      // Stop simulation if balance is exhausted
      if (balance <= 0) {
        console.log('Balance exhausted. Simulation stopped.');
        break;
      }
    }
  
    console.log('\n--- Slot Machine Simulation End ---');
    console.log(`Final Balance: ${balance} coins`);
  };

  console.log("Initial coin: ", 20);
  
  // Run Simulation
  simulateSpins(50, 20); // Simulate 50 spins starting with 20 coins
  