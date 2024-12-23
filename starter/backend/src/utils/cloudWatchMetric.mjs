import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch'; // Import necessary AWS SDK components

// Initialize a CloudWatch client
const cloudwatch = new CloudWatchClient();

/**
 * Send a success metric to CloudWatch.
 * @param {string} serviceName - The name of the service for which the metric is being reported.
 * @param {number} value - The value of the success metric (default is 0).
 * @returns {Promise<void>} - A promise that resolves when the metric is sent.
 */
export async function requestSuccessMetric(serviceName = 'ServiceName', value = 0) {
    const successMetricCommand = new PutMetricDataCommand({
        MetricData: [{
            MetricName: 'Success', // Metric name
            Dimensions: [{
                Name: 'ServiceName', // Name of the dimension
                Value: serviceName // Value of the dimension
            }],
            Unit: 'Count', // Unit of the metric
            Value: value // Value of the metric
        }],
        Namespace: 'TODOs/Serverless' // Namespace for the metrics
    });

    await cloudwatch.send(successMetricCommand); // Send the metric to CloudWatch
}

/**
 * Send a latency metric to CloudWatch.
 * @param {string} serviceName - The name of the service for which the metric is being reported.
 * @param {number} value - The value of the latency metric (in milliseconds) (default is 0).
 * @returns {Promise<void>} - A promise that resolves when the metric is sent.
 */
export async function requestLatencyMetric(serviceName = 'ServiceName', value = 0) {
    const latencyMetricCommand = new PutMetricDataCommand({
        MetricData: [{
            MetricName: 'Latency', // Metric name
            Dimensions: [{
                Name: 'ServiceName', // Name of the dimension
                Value: serviceName // Value of the dimension
            }],
            Unit: 'Milliseconds', // Unit of the metric
            Value: value // Value of the metric
        }],
        Namespace: 'TODOs/Serverless' // Namespace for the metrics
    });

    await cloudwatch.send(latencyMetricCommand); // Send the metric to CloudWatch
}
