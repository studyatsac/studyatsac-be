const JOB_NAME = {
    PAUSE: 'pause',
    OPENING: 'opening',
    RESPOND: 'respond'
};

/**
 * 30 Seconds
 */
const JOB_DELAY = 30 * 1000;

/**
 * 4 Hours
 */
const MAX_SESSION_TIME_IN_SECONDS = 4 * 60 * 60;
/**
 * 4 Hours
 */
const MAX_SESSION_TIME_IN_MILLISECONDS = MAX_SESSION_TIME_IN_SECONDS * 1000;
/**
 * 3 minutes
 */
const MAX_IDLE_TIME_IN_SECONDS = 3 * 60;
/**
 * 3 minutes
 */
const MAX_IDLE_TIME_IN_MILLISECONDS = MAX_IDLE_TIME_IN_SECONDS * 1000;
/**
 * 3 seconds
 */
const RESPOND_TIME_IN_SECONDS = 3;
/**
 * 3 seconds
 */
const RESPOND_TIME_IN_MILLISECONDS = RESPOND_TIME_IN_SECONDS * 1000;

const STATUS = {
    LISTENING: 'listening',
    PROCESSING: 'processing',
    SPEAKING: 'speaking'
};

const EVENT_NAME = {
    STATUS: 'status',
    RESPOND: 'respond'
};

const AI_SERVICE_EVENT_NAME = {
    INIT_CLIENT: 'init_client',
    SPEECH: 'speech',
    END_SPEECH: 'end_client',
    TEXT: 'text',
    CLIENT_TEXT: 'client_text',
    CLIENT_PROCESS: 'client_process'
};

module.exports = {
    JOB_NAME,
    JOB_DELAY,
    MAX_SESSION_TIME_IN_SECONDS,
    MAX_SESSION_TIME_IN_MILLISECONDS,
    MAX_IDLE_TIME_IN_SECONDS,
    MAX_IDLE_TIME_IN_MILLISECONDS,
    RESPOND_TIME_IN_SECONDS,
    RESPOND_TIME_IN_MILLISECONDS,
    STATUS,
    EVENT_NAME,
    AI_SERVICE_EVENT_NAME
};
