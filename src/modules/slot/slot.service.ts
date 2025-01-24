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

    if (result[0] === result[1] && result[1] === result[2]) {
      reward = this.rewards[`3${result[0]}`] || 0;
    } else if (result[0] === result[1]) {
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

    const spinCost = 1;
    this.userBalance -= spinCost;
    const spinResult = this.spinReels();
    const reward = this.calculateReward(spinResult);
    this.userBalance += reward;

    return {
      spinResult,
      reward,
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
    let balance = startingBalance;
    const spinResults: { spinNumber: number; result: string[]; reward: number; balance: number }[] = [];

    for (let i = 1; i <= numSpins; i++) {
      balance--;

      const spinResult = this.spinReels();
      const reward = this.calculateReward(spinResult);
      balance += reward;

      spinResults.push({
        spinNumber: i,
        result: spinResult,
        reward,
        balance,
      });

      if (balance <= 0) {
        break;
      }
    }

    return {
      finalBalance: balance,
      spinResults,
    };
  }

  /**
   * Performs a Monte Carlo simulation to analyze the slot machine's behavior over multiple trials.
   *
   * @param {number} numTrials - The number of trials to run.
   * @param {number} numSpins - The number of spins per trial.
   * @param {number} startingBalance - The initial balance for each trial.
   * @returns {object} Summary statistics of the simulation, including average rewards, bankruptcy rate, and reward distribution.
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
        balance--;

        const spinResult = this.spinReels();
        const reward = this.calculateReward(spinResult);
        balance += reward;
        totalReward += reward;

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
