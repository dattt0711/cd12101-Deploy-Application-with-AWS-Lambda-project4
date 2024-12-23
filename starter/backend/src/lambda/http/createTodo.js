// Import necessary modules and functions
import { requestSuccessMetric, requestLatencyMetric } from '../../utils/cloudWatchMetric.mjs'; // CloudWatch metrics
import { createLogger } from '../../utils/logger.mjs'; // Logger for debugging and auditing
import { createTodoBUL } from '../../bussinessLogic/todos.mjs';
import { responseError, responseSuccess } from '../ultilities.mjs';

// Set up logging
const logger = createLogger('createTodo'); // Create a logger instance with a function identifier

// Main handler function for creating a todo
export async function handler(event) {
    const startTime = Date.now(); // Record the start time for latency calculation

    try {
        // Log the creation of the new todo item
        logger.info('Creating new Todo');
        const resultTodoItem = await createTodoBUL(event);
        logger.info('Created new Todo.', { resultTodoItem });
        // Log metrics for the request
        await requestLatencyMetric('createTodo', Date.now() - startTime);
        await requestSuccessMetric('createTodo', 1); // Log success metric
     
        return responseSuccess(JSON.stringify({ item: resultTodoItem }));

    } catch (error) {
        // Handle errors
        logger.error('Error creating Todo:', { message: error.message, error });

        // Log failure metric
        await requestSuccessMetric('createTodo', 0); 

        return responseError(JSON.stringify({ error: error.message || 'Internal server error' }));
    }
}