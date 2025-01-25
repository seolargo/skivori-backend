import { Handler } from '@netlify/functions';
import { SlotService } from '../../src/modules/slot/slot.service';

// Initialize SlotService
const slotService = new SlotService();

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
    // Call the resetBalance method from SlotService
    const result = slotService.resetBalance();

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
    console.error('Error in resetBalance function:', error.message);

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
