import { Handler } from '@netlify/functions';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { SlotService } from '../../src/modules/slot/slot.service';
import { getCommonHeaders } from '../../src/common/utils/utils';
import { Actions } from '../../src/common/enums/enums';

// Cache the NestJS app instance
let app; 

export const handler: Handler = async (event) => {
  // Handle preflight OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: getCommonHeaders(),
      body: '',
    };
  }

  try {
    // Bootstrap the NestJS app if not already initialized
    if (!app) {
      app = await NestFactory.createApplicationContext(
        AppModule, {
          // Disable logger to improve performance in Netlify
          logger: false, 
        }
      );
    }

    const slotService = app.get(SlotService);

    // Parse request body to determine the action
    const { action } = JSON.parse(event.body || '{}');

    let result;

    // Handle reset or spin based on the action parameter
    if (action === Actions.Reset) {
      result = slotService.resetBalance();
    } else if (action === Actions.Spin) {
      result = slotService.spin();
    } else {
      throw new Error('Invalid action. Supported actions are "spin" and "reset".');
    }

    return {
      statusCode: 200,
      headers: getCommonHeaders(),
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Error in slot handler:', error.message);

    return {
      statusCode: 400,
      headers: getCommonHeaders(),
      body: JSON.stringify({ message: error.message || 'An unknown error occurred' }),
    };
  }
};
