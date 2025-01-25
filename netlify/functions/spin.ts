import { Handler } from '@netlify/functions';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { SlotService } from '../../src/modules/slot/slot.service';

let app; // Cache the NestJS app instance

export const handler: Handler = async (event) => {
  // Handle preflight OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: '',
    };
  }

  try {
    // Bootstrap the NestJS app if not already initialized
    if (!app) {
      app = await NestFactory.createApplicationContext(AppModule, {
        logger: false, // Disable logger to improve performance in Netlify
      });
    }

    const slotService = app.get(SlotService);

    // Parse request body to determine the action
    const { action } = JSON.parse(event.body || '{}');

    let result;

    // Handle reset or spin based on the action parameter
    if (action === 'reset') {
      result = slotService.resetBalance();
    } else if (action === 'spin') {
      result = slotService.spin();
    } else {
      throw new Error('Invalid action. Supported actions are "spin" and "reset".');
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // Allow all origins
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Error in slot handler:', error.message);

    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*', // Ensure CORS headers are sent even on error
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: JSON.stringify({ message: error.message || 'An unknown error occurred' }),
    };
  }
};
