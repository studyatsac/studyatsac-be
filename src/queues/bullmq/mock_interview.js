const { Queue } = require('bullmq');
const LogUtils = require('../../utils/logger');

module.exports = (redis, defaultJobOptions) => {
    const queueName = 'MockInterview';
    const finalQueueName = `${process.env.QUEUE_PREFIX}-${queueName}`;

    const queue = new Queue(finalQueueName, { connection: redis, defaultJobOptions });

    queue.on('error', (err) => {
        LogUtils.logError(`Queue ${queueName} Error: ${err.message}`);
    });

    return queue;
};
