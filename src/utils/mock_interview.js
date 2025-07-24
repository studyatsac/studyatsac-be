const Cache = require('../clients/cache/main');

const MOCK_INTERVIEW_PREFIX_KEY = 'mock_interview';

const setMockInterviewCache = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.set(key, true, 'EX', 60 * 60 * 4);
};

const isMockInterviewRunning = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    return !!(await Cache.get(key));
};

const deleteMockInterviewCache = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.del(key);
};

exports.setMockInterviewCache = setMockInterviewCache;
exports.deleteMockInterviewCache = deleteMockInterviewCache;
exports.isMockInterviewRunning = isMockInterviewRunning;

module.exports = exports;
