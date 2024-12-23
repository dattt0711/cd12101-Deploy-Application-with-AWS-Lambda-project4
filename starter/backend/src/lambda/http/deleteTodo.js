// Import necessary modules and functions
import { getTodoById } from '../../dataLayer/todosAccess.mjs'; // Functions to retrieve and delete a todo
import { getUserId, HTTP_STATUS_CODE, responseError, responseSuccess } from '../ultilities.mjs'; // Utilities for user ID and API responses
import { requestSuccessMetric, requestLatencyMetric } from '../../utils/cloudWatchMetric.mjs'; // CloudWatch metrics
import { createLogger } from '../../utils/logger.mjs'; // Logger for debugging and tracking
import { deleteTodoBUL } from '../../bussinessLogic/todos.mjs';

// Set up logging
const logger = createLogger('deleteTodo'); // Create a logger instance with a specific tag

// Main handler function for deleting a todo
export async function handler(event) {
    const startTime = Date.now(); 
    const userId = getUserId(event); 
    const todoId = event.pathParameters.todoId; 

    try {
        logger.info('Handling delete Todo', { todoId, userId });

        const todoInfo = await getTodoById(userId, todoId);
        if (!todoInfo) {
          return responseError(HTTP_STATUS_CODE.NOT_FOUND, JSON.stringify({ error: 'Todo does not exist' }));
        }

        await deleteTodoBUL(event);

        // Record metrics and return a successful response
        await requestLatencyMetric('deleteTodo', Date.now() - startTime);
        await requestSuccessMetric('deleteTodo', 1);

        return responseSuccess(JSON.stringify({ success: true }));
        
    } catch (error) {
        // Log the error and return an error response
        logger.error('Error deleting Todo:', { message: error.message, error });
        await requestSuccessMetric('deleteTodo', 0); // Log failed request metric
   
        return responseError(JSON.stringify({ error: error.message || 'Internal server error' }));
    }
}
