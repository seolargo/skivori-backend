import { Controller, Post, HttpException, HttpStatus, Body } from '@nestjs/common';
import { SlotService } from './slot.service';
import { appConfig } from '../../config/app.config';

/**
 * Controller for managing slot machine-related operations.
 * 
 * Provides endpoints for spinning the slot machine, simulating spins,
 * running Monte Carlo simulations, and resetting the user balance.
 */
@Controller(appConfig.slotRoutes.slot)
export class SlotController {
  constructor(private readonly slotService: SlotService) {}

  /**
   * Endpoint to perform a single spin of the slot machine.
   *
   * @returns {object} The result of the spin, including the spin result, reward, and updated balance.
   * @throws {HttpException} If there is an error during the spin process.
   */
  @Post(appConfig.slotRoutes.spin)
  spinSlot() {
    try {
      const result = this.slotService.spin();
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException('An unknown error occurred', HttpStatus.BAD_REQUEST);
      }
    }
  }

  /**
   * Endpoint to simulate multiple spins of the slot machine.
   *
   * @param {number} numSpins - The number of spins to simulate.
   * @param {number} startingBalance - The starting balance for the simulation.
   * @returns {object} The result of the simulation, including the final balance and details of each spin.
   */
  @Post(appConfig.slotRoutes.simulate)
  simulate(@Body('numSpins') numSpins: number, @Body('startingBalance') startingBalance: number) {
    if (!numSpins || !startingBalance || startingBalance <= 0 || numSpins <= 0) {
      return {
        success: false,
        message: 'Invalid input. Please provide a positive number of spins and starting balance.',
      };
    }

    const result = this.slotService.simulateSpins(numSpins, startingBalance);
    return {
      success: true,
      message: 'Simulation completed successfully.',
      data: result,
    };
  }

  /**
   * Endpoint to perform a Monte Carlo simulation on the slot machine.
   *
   * @param {number} numTrials - The number of trials to run.
   * @param {number} numSpins - The number of spins per trial.
   * @param {number} startingBalance - The starting balance for each trial.
   * @returns {object} The result of the simulation, including statistics such as average rewards, bankruptcy rate, and reward distribution.
   */
  @Post(appConfig.slotRoutes.monteCarlo)
  runMonteCarlo(
    @Body('numTrials') numTrials: number,
    @Body('numSpins') numSpins: number,
    @Body('startingBalance') startingBalance: number,
  ) {
    if (!numTrials || !numSpins || !startingBalance || numTrials <= 0 || numSpins <= 0 || startingBalance <= 0) {
      return {
        success: false,
        message: 'Invalid input. Please provide positive values for numTrials, numSpins, and startingBalance.',
      };
    }

    const simulationResult = this.slotService.monteCarloSimulation(numTrials, numSpins, startingBalance);

    return {
      success: true,
      data: simulationResult,
    };
  }

  /**
   * Endpoint to reset the user's balance to its initial value.
   *
   * @returns {object} A message confirming the balance reset and the new balance value.
   */
  @Post(appConfig.slotRoutes.reset)
  resetBalance() {
    return this.slotService.resetBalance();
  }
}
