const Cache = require('../clients/cache/main');
const MockInterviewConstants = require('../constants/mock_interview');

const MOCK_INTERVIEW_PREFIX_KEY = 'mock_interview';
const MOCK_INTERVIEW_SPEECH_TEXTS_PREFIX_KEY = 'mock_interview_speech_texts';

const setMockInterviewCache = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.set(key, true, 'EX', MockInterviewConstants.MAX_SESSION_TIME_IN_SECONDS + (5 * 60));
};

const isMockInterviewRunning = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    return !!(await Cache.get(key));
};

const deleteMockInterviewCache = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.del(key);
};

const saveMockInterviewSpeechTexts = async (userId, userInterviewUuid, texts) => {
    const key = `${MOCK_INTERVIEW_SPEECH_TEXTS_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    let currentTexts = await Cache.get(key);
    if (!currentTexts) currentTexts = [];
    else currentTexts = JSON.parse(currentTexts);

    await Cache.set(key, JSON.stringify([...currentTexts, ...texts]), 'EX', 60);
};

exports.setMockInterviewCache = setMockInterviewCache;
exports.deleteMockInterviewCache = deleteMockInterviewCache;
exports.isMockInterviewRunning = isMockInterviewRunning;
exports.saveMockInterviewSpeechTexts = saveMockInterviewSpeechTexts;

module.exports = exports;
