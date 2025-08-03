const JOB_NAME = {
    PAUSE: 'pause',
    STOP: 'stop',
    TIMER: 'timer',
    INIT: 'init',
    PROCESS: 'process',
    OPEN: 'open',
    RESPOND: 'respond',
    CONTINUE: 'continue',
    RESPOND_TRANSITION: 'respond_transition',
    CLOSE: 'close'
};

/**
 * 30 Seconds
 */
const JOB_DELAY = 30 * 1000;

const REVIEW_JOB_NAME = {
    OVERALL: 'overall',
    SECTION: 'section',
    ENTRY: 'entry'
};

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
const PROCESS_TIME_IN_SECONDS = 3;
/**
 * 3 seconds
 */
const PROCESS_TIME_IN_MILLISECONDS = PROCESS_TIME_IN_SECONDS * 1000;
/**
 * 30 seconds
 */
const STOP_DELAY_TIME_IN_SECONDS = 30;
/**
 * 30 seconds
 */
const STOP_DELAY_TIME_IN_MILLISECONDS = STOP_DELAY_TIME_IN_SECONDS * 1000;
/**
 * 5 seconds
 */
const TIMER_INTERVAL_IN_SECONDS = 5;
/**
 * 5 seconds
 */
const TIMER_INTERVAL_IN_MILLISECONDS = TIMER_INTERVAL_IN_SECONDS * 1000;

const STATUS = {
    NO_ACTIVITY: 'no_activity',
    LISTENING: 'listening',
    LISTENING_FAILED: 'listening_failed',
    LISTENING_DONE: 'listening_done',
    TRANSCRIBING: 'transcribing',
    TRANSCRIBING_FAILED: 'transcribing_failed',
    TRANSCRIBING_DONE: 'transcribing_done',
    PROCESSING: 'processing',
    PROCESSING_FAILED: 'processing_failed',
    PROCESSING_DONE: 'processing_done',
    SPEAKING: 'speaking',
    SPEAKING_FAILED: 'speaking_failed',
    SPEAKING_DONE: 'speaking_done'
};

const EVENT_NAME = {
    STATUS: 'status',
    CONTROL: 'control'
};

const AI_SERVICE_EVENT_NAME = {
    INIT_CLIENT: 'init_client',
    RESET_CLIENT: 'reset_client',
    END_SPEECH: 'end_client',
    CLIENT_PROCESS: 'client_process',
    SERVER_SPEECH: 'server_speech',
    SERVER_PROCESS: 'server_process',
    SERVER_TEXT: 'server_text',
    SERVER_STATUS: 'server_status'
};

const AI_SERVICE_PROCESS_EVENT_TAG = {
    OPENING: 'opening',
    CONTINUING: 'continuing',
    TRANSITIONING: 'transitioning',
    RESPONDING: 'responding',
    CLOSING: 'closing'
};

module.exports = {
    JOB_NAME,
    JOB_DELAY,
    REVIEW_JOB_NAME,
    MAX_SESSION_TIME_IN_SECONDS,
    MAX_SESSION_TIME_IN_MILLISECONDS,
    MAX_IDLE_TIME_IN_SECONDS,
    MAX_IDLE_TIME_IN_MILLISECONDS,
    PROCESS_TIME_IN_SECONDS,
    PROCESS_TIME_IN_MILLISECONDS,
    STOP_DELAY_TIME_IN_SECONDS,
    STOP_DELAY_TIME_IN_MILLISECONDS,
    TIMER_INTERVAL_IN_SECONDS,
    TIMER_INTERVAL_IN_MILLISECONDS,
    STATUS,
    EVENT_NAME,
    AI_SERVICE_EVENT_NAME,
    AI_SERVICE_PROCESS_EVENT_TAG
};
