// Import necessary modules and functions
import { getTodoById } from '../../dataLayer/todosAccess.mjs'; // Functions to interact with todo items
import { getUserId, responseError, responseSuccess } from '../ultilities.mjs'; // Utilities for user handling and responses
import { requestSuccessMetric, requestLatencyMetric } from '../../utils/cloudWatchMetric.mjs'; // CloudWatch metrics
import { createLogger } from '../../utils/logger.mjs'; // Logger utility for logging events
import { updateTodoBUL } from '../../bussinessLogic/todos.mjs';

const fTAG = 'updateTodo'; 
const logger = createLogger(fTAG); // Logger instance specific to the updateTodo function

// Main handler function for updating a todo item
export async function handler(event) {
    const startTime = Date.now(); // Start time for tracking latency
    const userId = getUserId(event); // Retrieve user ID from the event
    const todoId = event.pathParameters.todoId; // Get todo ID from path parameters

    try {
        const updatedTodo = JSON.parse(event.body); // Parse the updated todo data from the request body

        // Log the initiation of the update operation
        logger.info('Attempting to update Todo', { todoId, userId, ...updatedTodo });

        // Validate if the todo exists
        const todoInfo = await getTodoById(userId, todoId);
        if (!todoInfo) {
            return responseError(JSON.stringify({ error: 'Todo does not exist' }), HTTP_STATUS_CODE.NOT_FOUND);
        }

        // Update todo item with the new data
        await updateTodoBUL(event);

        // Record metrics for performance monitoring
        await requestLatencyMetric(fTAG, Date.now() - startTime);
        await requestSuccessMetric(fTAG, 1);
         return responseSuccess(JSON.stringify({
          success: true
        }));

    } catch (error) {
        // Error handling and logging
        logger.error('Error updating Todo', { message: error.message, error });
        await requestSuccessMetric(fTAG, 0);
       
        return responseError(JSON.stringify({ error: error.message || 'Internal server error' }));
    }
}