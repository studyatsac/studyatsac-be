const Cache = require('../clients/cache/main');
const MockInterviewConstants = require('../constants/mock_interview');

const MOCK_INTERVIEW_PREFIX_KEY = 'mock_interview';
const MOCK_INTERVIEW_SPEECH_TEXTS_PREFIX_KEY = 'mock_interview_speech_texts';

const setMockInterviewCache = async (userId, userInterviewUuid, jobId) => {
    const key = `${MOCK_INTERVIEW_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.set(key, jobId, 'EX', MockInterviewConstants.MAX_IDLE_TIME_IN_SECONDS + (5 * 60));
};

const getMockInterviewCache = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    return Cache.get(key);
};

const isMockInterviewRunning = async (userId, userInterviewUuid) => !!(await getMockInterviewCache(userId, userInterviewUuid));

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

const getMockInterviewSpeechTexts = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_SPEECH_TEXTS_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    const data = await Cache.get(key);
    return data && JSON.parse(data);
};

exports.setMockInterviewCache = setMockInterviewCache;
exports.deleteMockInterviewCache = deleteMockInterviewCache;
exports.getMockInterviewCache = getMockInterviewCache;
exports.isMockInterviewRunning = isMockInterviewRunning;
exports.saveMockInterviewSpeechTexts = saveMockInterviewSpeechTexts;
exports.getMockInterviewSpeechTexts = getMockInterviewSpeechTexts;

module.exports = exports;
