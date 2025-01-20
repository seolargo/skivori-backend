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
  
  // Monte Carlo Simulation
  const monteCarloSimulation = (numTrials, numSpins, startingBalance) => {
    let totalReward = 0;
    let totalSpins = 0;
    let bankruptcies = 0;
  
    const rewardDistribution = {};
  
    console.log('--- Monte Carlo Simulation Start ---\n');
  
    for (let trial = 1; trial <= numTrials; trial++) {
      let balance = startingBalance;
      let spins = 0;
  
      for (let i = 1; i <= numSpins; i++) {
        if (balance <= 0) {
          bankruptcies++;
          break;
        }
  
        spins++;
        balance--; // Deduct 1 coin for the spin
  
        const spinResult = spinReels();
        const reward = calculateReward(spinResult);
        balance += reward;
        totalReward += reward;
  
        // Track reward distribution
        if (reward > 0) {
          rewardDistribution[reward] = (rewardDistribution[reward] || 0) + 1;
        }
      }
  
      totalSpins += spins;
    }
  
    // Simulation results
    const averageRewardPerSpin = totalReward / totalSpins;
    const averageSpinsPerTrial = totalSpins / numTrials;
    const bankruptcyRate = bankruptcies / numTrials;
  
    console.log('\n--- Monte Carlo Simulation End ---');
    console.log(`Total Trials: ${numTrials}`);
    console.log(`Average Reward per Spin: ${averageRewardPerSpin.toFixed(2)} coins`);
    console.log(`Average Spins per Trial: ${averageSpinsPerTrial.toFixed(2)} spins`);
    console.log(`Bankruptcy Rate: ${(bankruptcyRate * 100).toFixed(2)}%`);
    console.log('Reward Distribution:', rewardDistribution);
  };
  
  // Run Monte Carlo Simulation
  monteCarloSimulation(100000, 50, 20); // Simulate 1000 trials, 50 spins per trial, starting with 20 coins
  