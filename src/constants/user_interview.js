const REVIEW_STATUS = {
    NOT_STARTED: 'not_started',
    NEED_REVIEW: 'need_review',
    QUEUED: 'queued',
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    PARTIALLY_COMPLETED: 'partially_completed',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
};

const STATUS = {
    NOT_STARTED: 'not_started',
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    PAUSED: 'paused',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
};

const SECTION_STATUS = { ...STATUS };

const SECTION_ANSWER_STATUS = {
    NOT_STARTED: 'not_started',
    PENDING: 'pending',
    ASKED: 'asked',
    ASKING: 'asking',
    FAILED_ASKING: 'failed_asking',
    ANSWERED: 'answered',
    ANSWERING: 'answering',
    FAILED_ANSWERING: 'failed_answering',
    CANCELLED: 'cancelled'
};

module.exports = {
    STATUS,
    SECTION_STATUS,
    SECTION_ANSWER_STATUS,
    REVIEW_STATUS
};
