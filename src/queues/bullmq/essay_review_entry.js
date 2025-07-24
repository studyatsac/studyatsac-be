const { Queue } = require('bullmq');
const LogUtils = require('../../utils/logger');

module.exports = (redis, defaultJobOptions) => {
    const queueName = 'EssayReviewEntry';
    const finalQueueName = `${process.env.QUEUE_PREFIX}-${queueName}`;

    const queue = new Queue(finalQueueName, { connection: redis, defaultJobOptions });

    queue.on('error', (err) => {
        LogUtils.loggingError(`Queue ${queueName} Error: ${err.message}`);
    });

    return queue;
};
