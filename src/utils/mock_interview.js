const Cache = require('../clients/cache/main');
const MockInterviewConstants = require('../constants/mock_interview');

const MOCK_INTERVIEW_PREFIX_KEY = 'mock_interview';
const MOCK_INTERVIEW_SID_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_sid`;
const MOCK_INTERVIEW_PAUSE_PREFIX_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_pause`;
const MOCK_INTERVIEW_RESPOND_PREFIX_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_respond`;
const MOCK_INTERVIEW_SPEECH_TEXTS_PREFIX_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_speech_texts`;
const MOCK_INTERVIEW_SPEECH_COUNTER_PREFIX_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_speech_counter`;

const getMockInterviewSid = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_SID_KEY}-${userId}-${userInterviewUuid}`;
    return Cache.get(key);
};

const setMockInterviewSid = async (userId, userInterviewUuid, sid) => {
    const key = `${MOCK_INTERVIEW_SID_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.set(key, sid, 'EX', MockInterviewConstants.MAX_SESSION_TIME_IN_SECONDS + (5 * 60));
};

const deleteMockInterviewSid = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_SID_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.del(key);
};

const setMockInterviewPauseJobCache = async (userId, userInterviewUuid, jobId) => {
    const key = `${MOCK_INTERVIEW_PAUSE_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.set(key, jobId, 'EX', MockInterviewConstants.MAX_IDLE_TIME_IN_SECONDS + (5 * 60));
};

const getMockInterviewPauseJobCache = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_PAUSE_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    return Cache.get(key);
};

const isMockInterviewRunning = async (userId, userInterviewUuid) => !!(await getMockInterviewPauseJobCache(userId, userInterviewUuid));

const deleteMockInterviewPauseJobCache = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_PAUSE_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.del(key);
};

const setMockInterviewRespondJobCache = async (userId, userInterviewUuid, jobId) => {
    const key = `${MOCK_INTERVIEW_RESPOND_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.set(key, jobId, 'EX', MockInterviewConstants.RESPOND_TIME_IN_SECONDS + (3 * 60));
};

const getMockInterviewRespondJobCache = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_RESPOND_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    return Cache.get(key);
};

const deleteMockInterviewRespondJobCache = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_RESPOND_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.del(key);
};

const getMockInterviewSpeechTexts = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_SPEECH_TEXTS_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    const data = await Cache.get(key);
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
    await Cache.set(key, JSON.stringify(currentTexts), 'EX', 60);

    return currentTexts;
};

const deleteMokInterviewSpeechTexts = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_SPEECH_TEXTS_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.del(key);
};

const getMockInterviewSpeechCounter = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_SPEECH_COUNTER_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    return Number(await Cache.get(key)) || 0;
};

const incrementMockInterviewSpeechCounter = async (userId, userInterviewUuid) => {
    const current = await getMockInterviewSpeechCounter(userId, userInterviewUuid);

    const key = `${MOCK_INTERVIEW_SPEECH_COUNTER_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    const next = current + 1;
    await Cache.set(key, next, 'EX', 60);

    return next;
};

const decrementMockInterviewSpeechCounter = async (userId, userInterviewUuid) => {
    const current = await getMockInterviewSpeechCounter(userId, userInterviewUuid);

    const key = `${MOCK_INTERVIEW_SPEECH_COUNTER_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    const next = Math.max(current - 1, 0);
    await Cache.set(key, next, 'EX', 60);

    return next;
};

exports.getMockInterviewSid = getMockInterviewSid;
exports.setMockInterviewSid = setMockInterviewSid;
exports.deleteMockInterviewSid = deleteMockInterviewSid;
exports.setMockInterviewPauseJobCache = setMockInterviewPauseJobCache;
exports.getMockInterviewPauseJobCache = getMockInterviewPauseJobCache;
exports.isMockInterviewRunning = isMockInterviewRunning;
exports.deleteMockInterviewPauseJobCache = deleteMockInterviewPauseJobCache;
exports.setMockInterviewRespondJobCache = setMockInterviewRespondJobCache;
exports.getMockInterviewRespondJobCache = getMockInterviewRespondJobCache;
exports.deleteMockInterviewRespondJobCache = deleteMockInterviewRespondJobCache;
exports.hasMockInterviewSpeechTexts = hasMockInterviewSpeechTexts;
exports.getMockInterviewSpeechTexts = getMockInterviewSpeechTexts;
exports.updateMockInterviewSpeechTexts = updateMockInterviewSpeechTexts;
exports.deleteMockInterviewSpeechTexts = deleteMokInterviewSpeechTexts;
exports.getMockInterviewSpeechCounter = getMockInterviewSpeechCounter;
exports.incrementMockInterviewSpeechCounter = incrementMockInterviewSpeechCounter;
exports.decrementMockInterviewSpeechCounter = decrementMockInterviewSpeechCounter;

module.exports = exports;
