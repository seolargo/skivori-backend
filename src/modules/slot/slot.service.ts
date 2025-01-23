import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class SlotService {
  private readonly INITIAL_BALANCE = 20; // Define the initial balance
  private userBalance = this.INITIAL_BALANCE; // Initialize user balance

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

  private spinReels(): string[] {
    return this.reels.map((reel) => reel[Math.floor(Math.random() * reel.length)]);
  }

  private calculateReward(result: string[]): number {
    let reward = 0;

    if (result[0] === result[1] && result[1] === result[2]) {
      reward = this.rewards[`3${result[0]}`] || 0;
    } else if (result[0] === result[1]) {
      reward = this.rewards[`2${result[0]}`] || 0;
    }

    return reward;
  }

  /**
   * Resets the user balance to the initial balance.
   */
  resetBalance() {
    this.userBalance = this.INITIAL_BALANCE; // Reset balance to the initial value
    return {
      message: 'Balance has been reset successfully.',
      balance: this.userBalance,
    };
  }

  /**
   * Handles a spin and calculates the updated balance.
   */
  spin() {
    if (this.userBalance <= 0) {
      throw new HttpException('Insufficient balance to spin!', HttpStatus.BAD_REQUEST);
    }

    const spinCost = 1;
    this.userBalance -= spinCost; // Deduct spin cost
    const spinResult = this.spinReels(); // Get spin result
    const reward = this.calculateReward(spinResult); // Calculate reward
    const updatedBalance = this.userBalance + reward; // Explicitly calculate updated balance
    this.userBalance = updatedBalance; // Update user balance

    return {
      spinResult,
      reward,
      updatedBalance, // Return the updated balance
    };
  }

  /**
   * Simulates multiple spins for testing purposes.
   */
  public simulateSpins(numSpins: number, startingBalance: number) {
    let balance = startingBalance;
    const spinResults: { spinNumber: number; result: string[]; reward: number; balance: number }[] = [];

    for (let i = 1; i <= numSpins; i++) {
      balance--; // Deduct spin cost

      const spinResult = this.spinReels(); // Spin the reels
      const reward = this.calculateReward(spinResult); // Calculate reward
      balance += reward; // Update balance with reward

      // Store spin result
      spinResults.push({
        spinNumber: i,
        result: spinResult,
        reward,
        balance,
      });

      // Stop simulation if balance is exhausted
      if (balance <= 0) {
        break;
      }
    }

    return {
      finalBalance: balance,
      spinResults: spinResults,
    };
  }

  /**
   * Performs a Monte Carlo simulation to analyze the slot machine's behavior.
   */
  public monteCarloSimulation(numTrials: number, numSpins: number, startingBalance: number) {
    let totalReward = 0;
    let totalSpins = 0;
    let bankruptcies = 0;

    const rewardDistribution: { [key: number]: number } = {};

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

        const spinResult = this.spinReels(); // Spin the reels
        const reward = this.calculateReward(spinResult); // Calculate reward
        balance += reward;
        totalReward += reward;

        // Track reward distribution
        if (reward > 0) {
          rewardDistribution[reward] = (rewardDistribution[reward] || 0) + 1;
        }
      }

      totalSpins += spins;
    }

    const averageRewardPerSpin = totalReward / totalSpins;
    const averageSpinsPerTrial = totalSpins / numTrials;
    const bankruptcyRate = bankruptcies / numTrials;

    return {
      totalTrials: numTrials,
      averageRewardPerSpin: parseFloat(averageRewardPerSpin.toFixed(2)),
      averageSpinsPerTrial: parseFloat(averageSpinsPerTrial.toFixed(2)),
      bankruptcyRate: parseFloat((bankruptcyRate * 100).toFixed(2)),
      rewardDistribution,
    };
  }
}
