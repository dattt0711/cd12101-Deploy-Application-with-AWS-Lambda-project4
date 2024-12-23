import { createTodo, getTodoById, deleteTodo, updateTodo, getTodosByUserId } from '../dataLayer/todosAccess.mjs'; // Function to add a new todo to the data layer
import { getUserId } from '../lambda/ultilities.mjs'; // Utilities for user ID and API responses
import { v4 } from 'uuid'; // UUID generator for unique item IDs
import { getUploadUrl, buildS3Url } from '../fileStorage/attachmentUtils.mjs'; // Functions for managing file uploads in S3

export async function createTodoBUL(event) {
  // Generate a unique ID for the new todo item
  const itemId = v4();
  // Retrieve user ID from the event object
  const userId = getUserId(event);
  // Parse the new todo data from the request body
  const newTodo = JSON.parse(event.body);

  // Create the new todo item object
  const newTodoItem = {
    todoId: itemId,
    userId,
    createdAt: new Date().toISOString(), // Timestamp for when the todo is created
    attachmentUrl: '', // Placeholder for attachments
    done: false, // Default status of the todo
    ...newTodo // Merge additional properties from the input
  };

  // Save the new todo item to the database
  await createTodo(newTodoItem);
  return newTodoItem
}

export async function updateTodoBUL(event) {
  const userId = getUserId(event); // Retrieve user ID from the event
  const todoId = event.pathParameters.todoId; // Get todo ID from path parameters

  const updatedTodo = JSON.parse(event.body); // Parse the updated todo data from the request body
  // Update todo item with the new data
  await updateTodo({ todoId, userId }, updatedTodo);
}

export async function deleteTodoBUL(event) {
  const userId = getUserId(event); // Retrieve user ID from the event
  const todoId = event.pathParameters.todoId; // Extract the todo ID from the path parameters
  // Proceed to delete the todo item
  await deleteTodo({ todoId, userId });
}

export async function getTodosBUL(event) {
  const userId = getUserId(event); // Retrieve the user ID from the event

  // Fetch all todos associated with the specified user ID
  const todos = await getTodosByUserId(userId);
  return todos;
}

export async function generateUploadUrlBUL(event) {
  const userId = getUserId(event); // Retrieve user ID from the event
  const todoId = event.pathParameters.todoId; // Extract todoId from path parameters

  // Generate the upload URL for the todo item
  const uploadImageUrl = await getUploadUrl(todoId);

  // Build S3 URL for storing attachments and update the todo item
  const attachmentUrl = buildS3Url(todoId);
  await updateTodo({ todoId, userId }, { attachmentUrl });

  return uploadImageUrl

}