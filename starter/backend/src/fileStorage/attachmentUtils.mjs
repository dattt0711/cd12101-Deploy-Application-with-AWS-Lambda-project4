import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import AWSXRay from 'aws-xray-sdk-core';

// Create an S3 client with AWS X-Ray integration for monitoring
const s3Client = AWSXRay.captureAWSv3Client(new S3Client());

// Environment variables for S3 bucket name and signed URL expiration
const BUCKET_NAME = process.env.IMAGES_S3_BUCKET; // S3 bucket name
const URL_EXPIRATION = parseInt(process.env.SIGNED_URL_EXPIRATION, 10); // URL expiration time in seconds

/**
 * Generate a signed URL for uploading an object to S3.
 * @param {string} todoId - The ID of the todo item, used as the object key in S3.
 * @returns {Promise<string>} - A promise that resolves to the signed URL.
 */
export async function getUploadUrl(todoId) {
    const segment = AWSXRay.getSegment();
    const subsegment = segment.addNewSubsegment('getUploadUrl');

    try {
        // Create a PutObjectCommand to generate a signed URL for uploading
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: todoId,
        });

        const url = await getSignedUrl(s3Client, command, {
            expiresIn: URL_EXPIRATION, // Set expiration time for the signed URL
        });

        subsegment.addAnnotation('status', 'success');
        return url; // Return the signed URL
    } catch (error) {
        subsegment.addError(error);
        throw error; // Propagate error for handling at a higher level
    } finally {
        subsegment.close();
    }
}

/**
 * Build the public S3 URL for the uploaded object.
 * @param {string} id - The ID used as the object key in S3.
 * @returns {string} - The public URL of the object in S3.
 */
export function buildS3Url(id) {
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${id}`;
}
