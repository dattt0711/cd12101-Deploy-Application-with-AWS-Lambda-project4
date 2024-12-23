// Import necessary modules and functions
import { getTodoById } from '../../dataLayer/todosAccess.mjs'; // Functions to retrieve and update todo items
import { getUserId } from '../ultilities.mjs'; // Utilities for handling user sessions and API responses
import { requestSuccessMetric, requestLatencyMetric } from '../../utils/cloudWatchMetric.mjs'; // CloudWatch metrics for monitoring performance
import { createLogger } from '../../utils/logger.mjs'; // Logger to track events
import { generateUploadUrlBUL } from '../../bussinessLogic/todos.mjs';

// Set up logging with a unique function tag
const logger = createLogger('generateUploadUrl');

// Main handler function for generating an upload URL for a todo item
export async function handler(event) {
    let resData
    const startTime = Date.now(); // Record start time for measuring latency
    const userId = getUserId(event); // Retrieve user ID from the event
    const todoId = event.pathParameters.todoId; // Extract todoId from path parameters

    try {
        logger.info('Generating upload URL for Todo.', { todoId, userId });

        // Fetch and validate the specified todo item
        const todoInfo = await getTodoById(userId, todoId);
        if (!todoInfo) {
          resData = {
            statusCode: 404,
            headers: {
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Todo does not exist' })
          }
          return resData
        }

        const uploadImageUrl = await generateUploadUrlBUL(event);

        // Log metrics for the request
        await requestLatencyMetric('generateUploadUrl', Date.now() - startTime);
        await requestSuccessMetric('generateUploadUrl', 1);

        // Return a successful response containing the generated upload URL
        resData = {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ uploadUrl: uploadImageUrl })
        }
        return resData

    } catch (error) {
        // Log and return error response
        logger.error('Error generating upload URL:', { message: error.message, error });
        await requestSuccessMetric('generateUploadUrl', 0); // Log failure metric
        resData = {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            error: error.message || 'Internal server error'
          })
        }
        return resData;
    }
}
