import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

/**
 * Service for managing slot machine operations, including spins, balance management,
 * simulations, and statistical analysis using Monte Carlo methods.
 */
@Injectable()
export class SlotService {
  // Define the initial balance
  private readonly INITIAL_BALANCE = 20; 

  // Initialize user balance with the initial balance
  private userBalance = this.INITIAL_BALANCE; 

  private readonly reels = [
    ["cherry", "lemon", "apple", "lemon", "banana", "banana", "lemon", "lemon"],
    ["lemon", "apple", "lemon", "lemon", "cherry", "apple", "banana", "lemon"],
    ["lemon", "apple", "lemon", "apple", "cherry", "lemon", "banana", "lemon"],
  ];

  private readonly rewards: { [key: string]: number } = {
    "3cherry": 50,
    "2cherry": 40,
    "3apple": 20,
    "2apple": 10,
    "3banana": 15,
    "2banana": 5,
    "3lemon": 3,
  };

  /**
   * Spins the slot machine reels and returns the result.
   *
   * @returns {string[]} The result of the spin as an array of strings representing symbols.
   */
  private spinReels(): string[] {
    return this.reels.map((reel) => reel[Math.floor(Math.random() * reel.length)]);
  }

  /**
   * Calculates the reward based on the result of a spin.
   *
   * @param {string[]} result - The result of the spin.
   * @returns {number} The reward based on the spin result.
   */
  private calculateReward(result: string[]): number {
    let reward = 0;

    // Possible winning combinations:
    // Lemon, lemon, lemon
    // Cherry, cherry, lemon

    if (
      (result[0] === result[1]) && (result[1] === result[2])
    ) {
      reward = this.rewards[`3${result[0]}`] || 0;
    } else if (
      result[0] === result[1]
    ) {
      reward = this.rewards[`2${result[0]}`] || 0;
    }

    return reward;
  }

  /**
   * Resets the user's balance to the initial balance.
   *
   * @returns {object} An object containing the reset balance and a success message.
   */
  resetBalance() {
    this.userBalance = this.INITIAL_BALANCE;
    
    return {
      message: 'Balance has been reset successfully.',
      balance: this.userBalance,
    };
  }

  /**
   * Performs a single spin operation and updates the user's balance.
   *
   * @throws {HttpException} If the user has insufficient balance to spin.
   * @returns {object} The result of the spin, including the spin result, reward, and updated balance.
   */
  spin() {
    if (this.userBalance <= 0) {
      throw new HttpException('Insufficient balance to spin!', HttpStatus.BAD_REQUEST);
    }

    // Define the cost of a single spin
    const spinCost = 1;

    // Deduct the spin cost from the user's balance
    this.userBalance -= spinCost;

    // Generate the result of spinning the reels
    const spinResult = this.spinReels();

    // Calculate the reward based on the spin result
    const reward = this.calculateReward(spinResult);

    // Add the reward to the user's balance
    this.userBalance += reward;

    // Return the spin result, reward, and updated balance to the caller
    return {
      // The outcome of the spin
      spinResult, 
      // The reward earned from the spin
      reward, 
      // The user's balance after the spin
      updatedBalance: this.userBalance, 
    };
  }

  /**
   * Simulates multiple spins to analyze outcomes over a set number of spins.
   *
   * @param {number} numSpins - The number of spins to simulate.
   * @param {number} startingBalance - The initial balance for the simulation.
   * @returns {object} The final balance and details of each spin.
   */
  public simulateSpins(numSpins: number, startingBalance: number) {
    // Initialize the user's balance with the starting balance.
    let balance = startingBalance;
  
    // Create an array to store the results of each spin.
    const spinResults = [];
  
    // Iterate for the number of spins or until the balance is depleted.
    for (let i = 1; i <= numSpins && balance > 0; i++) {
      // Deduct the cost of the spin.
      balance--; 
      
      // Get the spin result by spinning the reels.
      const spinResult = this.spinReels(); 

      // Calculate the reward based on the spin result.
      const reward = this.calculateReward(spinResult); 

      // Add the reward to the balance.
      balance += reward; 
  
      // Add the current spin's details to the results array.
      spinResults.push({
        // The current spin number.
        spinNumber: i, 
        // The result of the spin (symbols on the reels).
        result: spinResult, 
        // The reward earned from the spin.
        reward, 
        // The updated balance after the spin.
        balance, 
      });
    }
  
    // Return the final balance and all the spin results after the simulation.
    return {
      // The user's remaining balance after all spins.
      finalBalance: balance, 
      // Array of all spin results.
      spinResults, 
    };
  }

  /**
   * Performs a Monte Carlo simulation to analyze the slot machine's behavior over multiple trials.
   *
   * @param {number} numTrials - The number of trials to run.
   * @param {number} numSpins - The number of spins per trial.
   * @param {number} startingBalance - The initial balance for each trial.
   * 
   * @returns {object} Summary statistics of the simulation, including average rewards, bankruptcy rate, and reward distribution.
   */
  public monteCarloSimulation(
    numTrials: number, 
    numSpins: number, 
    startingBalance: number
  ) {
    // Tracks the total rewards earned across all trials.
    let totalReward = 0; 
    // Tracks the total number of spins performed across all trials.
    let totalSpins = 0; 
    // Tracks the number of trials where the balance was exhausted.
    let bankruptcies = 0; 

    // Tracks the distribution of rewards (e.g., how many times each reward amount was won).
    const rewardDistribution: Record<number, number> = {};

    // Loop through each trial.
    for (let trial = 0; trial < numTrials; trial++) {
      // Initialize the balance for the current trial.
      let balance = startingBalance; 

      // Initialize the spin count for the current trial.
      let spins = 0; 

      // Perform spins until the balance is exhausted or the maximum spins are reached.
      while (spins < numSpins && balance > 0) {
        // Increment the spin counter.
        spins++; 
        // Deduct the spin cost from the balance.
        balance--; 

        // Calculate the reward for the spin and update the balance.
        const reward = this.calculateReward(this.spinReels());
        balance += reward;

        // Add the reward to the total rewards across all trials.
        totalReward += reward; 

        // Update the reward distribution if a reward was earned.
        if (reward > 0) {
          rewardDistribution[reward] = (rewardDistribution[reward] || 0) + 1;
        }
      }

      // Add the spins from the current trial to the total spins.
      totalSpins += spins; 

      // If the balance is exhausted, increment the bankruptcy count.
      if (balance <= 0) {
        bankruptcies++;
      }
    }

    // Calculate and return the simulation results.
    return {
      // Total number of trials.
      totalTrials: numTrials, 
      // Average reward earned per spin.
      averageRewardPerSpin: +(totalReward / totalSpins).toFixed(2), 
      // Average number of spins performed per trial.
      averageSpinsPerTrial: +(totalSpins / numTrials).toFixed(2), 
      // Percentage of trials that ended in bankruptcy.
      bankruptcyRate: +((bankruptcies / numTrials) * 100).toFixed(2), 
      // Distribution of rewards earned.
      rewardDistribution, 
    };
};
}
