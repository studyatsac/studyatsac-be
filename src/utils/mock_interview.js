const Uuid = require('uuid');
const Cache = require('../clients/cache/main');
const MockInterviewConstants = require('../constants/mock_interview');

const MOCK_INTERVIEW_PREFIX_KEY = 'mock_interview';
const MOCK_INTERVIEW_SESSION_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_session`;
const MOCK_INTERVIEW_SID_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_sid`;
const MOCK_INTERVIEW_PAUSE_PREFIX_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_pause`;
const MOCK_INTERVIEW_RESPOND_PREFIX_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_respond`;
const MOCK_INTERVIEW_SPEECH_TEXTS_PREFIX_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_speech_texts`;
const MOCK_INTERVIEW_SPEECH_COUNTER_PREFIX_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_speech_counter`;

const setMockInterviewSessionId = async (userId, userInterviewUuid, sessionId) => {
    const key = `${MOCK_INTERVIEW_SESSION_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.setCache(key, sessionId, MockInterviewConstants.MAX_SESSION_TIME_IN_MILLISECONDS + (60 * 1000));
};

const generateMockInterviewSessionId = async (userId, userInterviewUuid) => {
    const sessionId = Uuid.v4();
    await setMockInterviewSessionId(userId, userInterviewUuid, sessionId);

    return sessionId;
};

const getMockInterviewSessionId = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_SESSION_KEY}-${userId}-${userInterviewUuid}`;
    return Cache.getCache(key);
};

const deleteMockInterviewSessionId = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_SESSION_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.deleteCache(key);
};

const isMockInterviewRunning = async (userId, userInterviewUuid) => !!(await getMockInterviewSessionId(userId, userInterviewUuid));

const getMockInterviewSid = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_SID_KEY}-${userId}-${userInterviewUuid}`;
    return Cache.getCache(key);
};

const setMockInterviewSid = async (userId, userInterviewUuid, sid) => {
    const key = `${MOCK_INTERVIEW_SID_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.setCache(key, sid, MockInterviewConstants.MAX_SESSION_TIME_IN_MILLISECONDS + (5 * 60 * 1000));
};

const deleteMockInterviewSid = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_SID_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.deleteCache(key);
};

const setMockInterviewPauseJobId = async (userId, userInterviewUuid, jobId) => {
    const key = `${MOCK_INTERVIEW_PAUSE_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.setCache(key, jobId, MockInterviewConstants.MAX_IDLE_TIME_IN_MILLISECONDS + (5 * 60 * 1000));
};

const getMockInterviewPauseJobId = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_PAUSE_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    return Cache.getCache(key);
};

const deleteMockInterviewPauseJobId = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_PAUSE_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.deleteCache(key);
};

const setMockInterviewRespondJobId = async (userId, userInterviewUuid, jobId) => {
    const key = `${MOCK_INTERVIEW_RESPOND_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.setCache(key, jobId, MockInterviewConstants.RESPOND_TIME_IN_MILLISECONDS + (3 * 60 * 1000));
};

const getMockInterviewRespondJobId = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_RESPOND_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    return Cache.getCache(key);
};

const deleteMockInterviewRespondJobId = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_RESPOND_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.deleteCache(key);
};

const getMockInterviewSpeechTexts = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_SPEECH_TEXTS_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    const data = await Cache.getCache(key);
    if (!data) return [];

    const texts = JSON.parse(data);
    if (!Array.isArray(texts)) return [];

    return texts;
};

const hasMockInterviewSpeechTexts = async (userId, userInterviewUuid, texts) => {
    const targetTexts = texts || await getMockInterviewSpeechTexts(userId, userInterviewUuid);
    return !!targetTexts && Array.isArray(targetTexts) && targetTexts.length > 0;
};

const updateMockInterviewSpeechTexts = async (userId, userInterviewUuid, texts, previousTexts) => {
    let currentTexts = previousTexts || await getMockInterviewSpeechTexts(userId, userInterviewUuid);
    if (!currentTexts) currentTexts = [];

    currentTexts.push(...texts);
    currentTexts.sort((text, textB) => text.startTime - textB.startTime);

    const key = `${MOCK_INTERVIEW_SPEECH_TEXTS_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.setCache(key, JSON.stringify(currentTexts), 60 * 1000);

    return currentTexts;
};

const deleteMokInterviewSpeechTexts = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_SPEECH_TEXTS_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.deleteCache(key);
};

const getMockInterviewSpeechCounter = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_SPEECH_COUNTER_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    return Number(await Cache.getCache(key)) || 0;
};

const incrementMockInterviewSpeechCounter = async (userId, userInterviewUuid) => {
    const current = await getMockInterviewSpeechCounter(userId, userInterviewUuid);

    const key = `${MOCK_INTERVIEW_SPEECH_COUNTER_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    const next = current + 1;
    await Cache.setCache(key, next, 60 * 1000);

    return next;
};

const decrementMockInterviewSpeechCounter = async (userId, userInterviewUuid) => {
    const current = await getMockInterviewSpeechCounter(userId, userInterviewUuid);

    const key = `${MOCK_INTERVIEW_SPEECH_COUNTER_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    const next = Math.max(current - 1, 0);
    await Cache.setCache(key, next, 60 * 1000);

    return next;
};

exports.generateMockInterviewSessionId = generateMockInterviewSessionId;
exports.setMockInterviewSessionId = setMockInterviewSessionId;
exports.getMockInterviewSessionId = getMockInterviewSessionId;
exports.deleteMockInterviewSessionId = deleteMockInterviewSessionId;
exports.isMockInterviewRunning = isMockInterviewRunning;
exports.getMockInterviewSid = getMockInterviewSid;
exports.setMockInterviewSid = setMockInterviewSid;
exports.deleteMockInterviewSid = deleteMockInterviewSid;
exports.setMockInterviewPauseJobId = setMockInterviewPauseJobId;
exports.getMockInterviewPauseJobId = getMockInterviewPauseJobId;
exports.deleteMockInterviewPauseJobId = deleteMockInterviewPauseJobId;
exports.setMockInterviewRespondJobId = setMockInterviewRespondJobId;
exports.getMockInterviewRespondJobId = getMockInterviewRespondJobId;
exports.deleteMockInterviewRespondJobId = deleteMockInterviewRespondJobId;
exports.hasMockInterviewSpeechTexts = hasMockInterviewSpeechTexts;
exports.getMockInterviewSpeechTexts = getMockInterviewSpeechTexts;
exports.updateMockInterviewSpeechTexts = updateMockInterviewSpeechTexts;
exports.deleteMockInterviewSpeechTexts = deleteMokInterviewSpeechTexts;
exports.getMockInterviewSpeechCounter = getMockInterviewSpeechCounter;
exports.incrementMockInterviewSpeechCounter = incrementMockInterviewSpeechCounter;
exports.decrementMockInterviewSpeechCounter = decrementMockInterviewSpeechCounter;

module.exports = exports;
