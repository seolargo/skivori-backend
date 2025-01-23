// slot.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class SlotService {
  private userBalance = 20;

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

  spin() {
    if (this.userBalance <= 0) {
      throw new HttpException('Insufficient balance to spin!', HttpStatus.BAD_REQUEST);
    }

    this.userBalance--;
    const spinResult = this.spinReels();
    const reward = this.calculateReward(spinResult);
    this.userBalance += reward;

    return {
      spinResult,
      reward,
      updatedBalance: this.userBalance,
    };
  }

  public simulateSpins(numSpins: number, startingBalance: number) {
    let balance = startingBalance;
    const spinResults: { spinNumber: number; result: string[]; reward: number; balance: number }[] = [];

    for (let i = 1; i <= numSpins; i++) {
      // Deduct 1 coin for the spin
      balance--;

      // Spin the reels
      const spinResult = this.spinReels();

      // Calculate reward
      const reward = this.calculateReward(spinResult);

      // Update balance with the reward
      balance += reward;

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
      spinResults: spinResults
    };
  }

  public monteCarloSimulation(numTrials: number, numSpins: number, startingBalance: number) {
    /*
      {
        "success": true,
        "data": {
            "success": true,
            "data": {
                "totalTrials": 100000,
                "averageRewardPerSpin": 1.6,
                "averageSpinsPerTrial": 47.35,
                "bankruptcyRate": 15.53,
                "rewardDistribution": {
                    "3": 591607,
                    "5": 129366,
                    "10": 111132,
                    "15": 18341,
                    "20": 36887,
                    "40": 64743,
                    "50": 9260
                }
            }
        }
      }

      This graph represents the reward distribution from the Monte Carlo simulation. Here's what it tells us:

1. Most Frequent Reward (Peak at 3 Coins)
The reward of 3 coins occurred 591,607 times, making it the most frequent reward.
This indicates that matches yielding a reward of 3 coins (e.g., "3 lemons in a row") are far more likely compared to other rewards.
2. Distribution of Higher Rewards
Higher rewards, such as 50 coins, occurred significantly less frequently (9,260 times), showing that achieving these matches (e.g., "3 cherries in a row") is much rarer.
Similarly, 40 coins occurred 64,743 times, while 20 coins occurred 36,887 times, showing that rewards generally decrease in frequency as the reward amount increases.
3. Probabilities Decrease with Larger Rewards
The graph demonstrates an inverse relationship between the reward amount and its frequency:
Smaller rewards (3, 5 coins) are more frequent.
Larger rewards (15, 20, 40, 50 coins) are rarer.
This pattern aligns with typical slot machine mechanics, where small wins are common, and large wins are infrequent to maintain balance.
4. Insights for Balance
High Bankruptcy Rate: Since the most frequent rewards are small (3 coins), players may still run out of balance unless they consistently hit larger rewards.
Sustainability: Rewards like 50 coins are extremely rare, so players are unlikely to accumulate a significant balance over time.
Takeaway
This reward distribution demonstrates a slot machine designed to:

Provide frequent small rewards (3 or 5 coins) to keep the game engaging.
Make larger rewards rare to ensure the game remains balanced and challenging for players.
Let me know if you'd like additional insights or another type of analysis!






You said:
is it good slot machine or bad?
ChatGPT said:
ChatGPT
The quality of the slot machine depends on who it’s designed for (players vs. operators) and the goals (engagement, fairness, profitability). Let’s analyze this slot machine based on the reward distribution and insights from the graph:

1. From the Player’s Perspective
Pros:
Frequent Small Wins: The high frequency of small rewards (e.g., 3 coins) keeps players engaged. Frequent rewards provide a sense of progress and make the game feel rewarding.
Occasional Big Wins: Rare but significant rewards (e.g., 40 or 50 coins) add excitement and create memorable moments for players.
Cons:
High Bankruptcy Risk: With a bankruptcy rate of 15.53%, many players will exhaust their starting balance without a big win. This could lead to frustration.
Net Loss Tendency: The small rewards often don’t cover the cost of spins, meaning players are likely to lose more over time unless they get very lucky.
Low Return on Investment (ROI): While occasional big wins exist, the overall distribution favors small payouts that don’t help sustain balance for long.
Player Verdict: The slot machine can be exciting initially but may frustrate players over time due to the difficulty of achieving big wins and the high risk of bankruptcy.

2. From the Operator’s Perspective
Pros:
Profitability: The frequent occurrence of small rewards ensures that players remain engaged while still gradually losing their balance, making the slot machine profitable over time.
Balanced Reward Curve: By making large rewards rare, the machine avoids payouts that could threaten its profitability.
Cons:
Retention Challenges: Players who frequently go bankrupt may stop playing, especially if they don’t feel rewarded or entertained after repeated losses.
Perceived Unfairness: Players may feel the machine is "rigged" or overly difficult to win big rewards, potentially harming the operator’s reputation.
Operator Verdict: This slot machine is profitable but could benefit from fine-tuning to improve player retention and satisfaction.

3. Fairness and Player Experience
Fairness:

The reward system follows a logical distribution: small rewards are common, while larger rewards are rare. This is typical for slot machines and ensures profitability.
However, if players experience frequent bankruptcies, they might perceive the machine as "unfair."
Player Experience:

The slot machine provides a mix of frequent, small wins and rare big wins, which creates excitement.
However, the high bankruptcy rate and low average rewards per spin (1.6 coins) can lead to frustration.
4. Suggestions for Improvement
If the goal is to create a better balance between engagement and profitability, here are some adjustments:

Increase Mid-Tier Rewards:
Rewards like 10, 15, and 20 coins could occur slightly more often to give players a better chance of recovering their balance.
Reduce Bankruptcy Rate:
Slightly increase the average reward per spin to allow players to play longer without drastically affecting profitability.
Introduce Bonus Features:
Add features like free spins or jackpots to make the game more exciting and reduce frustration from losses.
Final Verdict
For Players: This slot machine leans toward being difficult and risky, with frequent small wins but a high likelihood of running out of balance. It’s better for short-term excitement than long-term enjoyment.
For Operators: This slot machine is well-balanced for profitability but could benefit from tweaks to enhance player retention and satisfaction.
Would you like suggestions on how to adjust the reward logic in code to make it more balanced?
    */
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

        const spinResult = this.spinReels();
        const reward = this.calculateReward(spinResult);
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
