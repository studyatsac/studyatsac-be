const JOB_NAME = {
    PAUSE: 'pause'
};

/**
 * 3 minutes
 */
const MAX_IDLE_TIME_IN_SECONDS = 3 * 60;
/**
 * 3 minutes
 */
const MAX_IDLE_TIME_IN_MILLISECONDS = MAX_IDLE_TIME_IN_SECONDS * 1000;

module.exports = {
    JOB_NAME,
    MAX_IDLE_TIME_IN_SECONDS,
    MAX_IDLE_TIME_IN_MILLISECONDS
};
