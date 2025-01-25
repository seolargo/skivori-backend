import { Handler } from '@netlify/functions';
import { SlotService } from '../../src/modules/slot/slot.service';
import { getCommonHeaders } from '../../src/common/utils/utils';

// Initialize SlotService
const slotService = new SlotService();

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
    // Call the resetBalance method from SlotService
    const result = slotService.resetBalance();

    return {
      statusCode: 200,
      headers: getCommonHeaders(),
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Error in resetBalance function:', error.message);

    return {
      statusCode: 400,
      headers: getCommonHeaders(),
      body: JSON.stringify({ message: error.message || 'An unknown error occurred' }),
    };
  }
};
