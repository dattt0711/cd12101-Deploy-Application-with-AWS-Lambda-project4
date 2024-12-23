// Import necessary modules and functions
import { getTodosByUserId } from '../../dataLayer/todosAccess.mjs'; // Function to retrieve todos by user ID
import { getUserId, HTTP_STATUS_CODE, responseError, responseSuccess } from '../ultilities.mjs'; // Utilities for user ID retrieval and API responses
import { requestSuccessMetric, requestLatencyMetric } from '../../utils/cloudWatchMetric.mjs'; // Metrics for CloudWatch monitoring
import { createLogger } from '../../utils/logger.mjs'; // Logger for tracking events

// Set up logging with a unique function tag for better event tracking
const logger = createLogger('getTodos'); // Create a logger instance

// Main handler function for retrieving todo todos for a specific user
export async function handler(event) {
    let resData
    const startTime = Date.now(); // Record the start time for measuring latency
    const userId = getUserId(event); // Retrieve the user ID from the event

    try {
        // Fetch all todos associated with the specified user ID
        const todos = await getTodosByUserId(userId);

        // Record metrics for latency and success
        await requestLatencyMetric('getTodos', Date.now() - startTime);

        // Return a successful response containing the retrieved todos
        return responseSuccess(JSON.stringify({ items: todos }));

    } catch (error) {
        // Log any errors that occur during processing
        logger.error('Error retrieving todos:', { message: error.message, error });

        // Log a failed request metric
        await requestSuccessMetric('getTodos', 0);

        // Return an error response with an appropriate message
        return responseError(JSON.stringify({
          error: error.message || 'Internal server error'
        }), HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
}
