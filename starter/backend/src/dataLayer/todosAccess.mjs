import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import AWSXRay from 'aws-xray-sdk-core';

// Create a DynamoDB client with X-Ray integration
const dynamoDbClient = AWSXRay.captureAWSv3Client(DynamoDBDocument.from(new DynamoDB()));

// Environment variables for the DynamoDB table and user ID index
const TODO_TABLE = process.env.TODO_TABLE;
const USER_ID_INDEX = process.env.USER_ID_INDEX;

/**
 * Fetch a todo item by user ID and todo ID.
 * @param {string} userId - The ID of the user.
 * @param {string} todoId - The ID of the todo item.
 * @returns {Promise<object>} - The retrieved todo item.
 */
export async function getTodoById(userId, todoId) {
    const segment = AWSXRay.getSegment();
    const subsegment = segment.addNewSubsegment('getTodoById');

    try {
        const result = await dynamoDbClient.get({
            TableName: TODO_TABLE,
            Key: {
                userId,
                todoId,
            },
        });
        
        subsegment.addAnnotation('status', 'success');
        return result.Item; // Return the retrieved item.
    } catch (error) {
        subsegment.addError(error);
        throw error; // Propagate error for handling at a higher level.
    } finally {
        subsegment.close();
    }
}

/**
 * Fetch todos associated with a specific user ID.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array>} - An array of todos for the specified user.
 */
export async function getTodosByUserId(userId) {
    const segment = AWSXRay.getSegment();
    const subsegment = segment.addNewSubsegment('getTodosByUserId');

    try {
        const queryOpt = {
            TableName: TODO_TABLE,
            IndexName: USER_ID_INDEX,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId,
            },
        };

        const result = await dynamoDbClient.query(queryOpt);
        subsegment.addAnnotation('status', 'success');
        return result.Items; // Return the retrieved todo items.
    } catch (error) {
        subsegment.addError(error);
        throw error; // Propagate error for handling at a higher level.
    } finally {
        subsegment.close();
    }
}

/**
 * Update a specific todo item.
 * @param {Object} keyObj - The key of the todo item to update (contains userId and todoId).
 * @param {Object} updateData - The new data to update the todo item with.
 * @returns {Promise<boolean>} - True if the update was successful, otherwise false.
 */
export async function updateTodo(keyObj, updateData = {}) {
    const segment = AWSXRay.getSegment();
    const subsegment = segment.addNewSubsegment('updateTodo');

    try {
        if (!updateData || Object.keys(updateData).length === 0) {
            console.error('Update data is empty');
            return false; // Exit if there's no data to update.
        }

        // Prepare expression attribute names and values
        const updateExpression = [];
        const expressionAttributeValues = {};
        const expressionAttributeNames = {}; // This will hold the reserved keyword replacements

        // Reserved keywords in DynamoDB
        const reservedKeywords = ['name', 'done', 'dueDate', 'attachmentUrl'];

        // Loop through the updateData keys
        for (const key of Object.keys(updateData)) {
            // Use a placeholder for reserved words
            const attributeName = reservedKeywords.includes(key) ? `#${key}` : key; 
            if (reservedKeywords.includes(key)) {
                expressionAttributeNames[`#${key}`] = key; // map the placeholder to the actual name
            } else {
                expressionAttributeNames[`${key}`] = key;
            }

            // Add to the update expression
            updateExpression.push(`${attributeName} = :${key}`);
            expressionAttributeValues[`:${key}`] = updateData[key];
        }

        // Construct the parameters for the update operation.
        const params = {
            TableName: TODO_TABLE,
            Key: keyObj,
            UpdateExpression: `SET ${updateExpression.join(', ')}`,
            ExpressionAttributeValues: expressionAttributeValues,
            ExpressionAttributeNames: expressionAttributeNames, // Add this line
        };

        // Execute the update
        await dynamoDbClient.update(params);
        subsegment.addAnnotation('status', 'success');
        return true; // Indicate successful update
    } catch (error) {
        subsegment.addError(error);
        throw error; // Propagate error for handling at a higher level.
    } finally {
        subsegment.close();
    }
}

/**
 * Delete a specific todo item.
 * @param {Object} keyObj - The key of the todo item to delete (contains userId and todoId).
 * @returns {Promise<Object>} - The result of the deletion.
 */
export async function deleteTodo(keyObj) {
    const segment = AWSXRay.getSegment();
    const subsegment = segment.addNewSubsegment('deleteTodo');

    try {
        const result = await dynamoDbClient.delete({
            TableName: TODO_TABLE,
            Key: keyObj,
        });

        subsegment.addAnnotation('status', 'success');
        return result; // Return the result of the deletion operation.
    } catch (error) {
        subsegment.addError(error);
        throw error; // Propagate error for handling at a higher level.
    } finally {
        subsegment.close();
    }
}

/**
 * Create a new todo item.
 * @param {Object} data - The todo item data to create.
 * @returns {Promise<void>}
 */
export async function createTodo(data) {
    const segment = AWSXRay.getSegment();
    const subsegment = segment.addNewSubsegment('createTodo');

    try {
        await dynamoDbClient.put({
            TableName: TODO_TABLE,
            Item: data,
        });

        subsegment.addAnnotation('status', 'success');
    } catch (error) {
        subsegment.addError(error);
        throw error; // Propagate error for handling at a higher level.
    } finally {
        subsegment.close();
    }
}
