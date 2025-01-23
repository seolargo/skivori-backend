// slot.controller.ts
import { Controller, Post, HttpException, HttpStatus, Body } from '@nestjs/common';
import { SlotService } from './slot.service';

/*
  http://localhost:3001/api/slot/spin
*/

@Controller('slot')
export class SlotController {
  constructor(private readonly slotService: SlotService) {}

  @Post('spin')
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

  /*
    http://localhost:3001/api/slot/simulate

    {
      "numSpins": 50,
      "startingBalance": 20
    }

    {
      "success": true,
      "message": "Simulation completed successfully.",
      "data": {
        "finalBalance": 30,
        "spinResults": [
          {
            "spinNumber": 1,
            "result": ["lemon", "cherry", "lemon"],
            "reward": 0,
            "balance": 19
          },
          ...
        ]
      }
    }
  */

  @Post('simulate')
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

  @Post('monte-carlo')
  runMonteCarlo(
    @Body('numTrials') numTrials: number,
    @Body('numSpins') numSpins: number,
    @Body('startingBalance') startingBalance: number,
  ) {
    // Validate input parameters
    if (!numTrials || !numSpins || !startingBalance || numTrials <= 0 || numSpins <= 0 || startingBalance <= 0) {
      return {
        success: false,
        message: 'Invalid input. Please provide positive values for numTrials, numSpins, and startingBalance.',
      };
    }

    // Call the service method
    const simulationResult = this.slotService.monteCarloSimulation(numTrials, numSpins, startingBalance);

    return {
      success: true,
      data: simulationResult,
    };
  }
}
