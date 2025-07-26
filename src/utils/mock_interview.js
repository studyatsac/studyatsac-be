const Cache = require('../clients/cache/main');
const MockInterviewConstants = require('../constants/mock_interview');

const MOCK_INTERVIEW_PREFIX_KEY = 'mock_interview';
const MOCK_INTERVIEW_PAUSE_PREFIX_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_pause`;
const MOCK_INTERVIEW_RESPOND_PREFIX_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_respond`;
const MOCK_INTERVIEW_SPEECH_TEXTS_PREFIX_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_speech_texts`;

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
    await Cache.set(key, jobId, 'EX', MockInterviewConstants.RESPOND_TIME_IN_SECONDS + 1);
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

const saveMockInterviewSpeechTexts = async (userId, userInterviewUuid, texts) => {
    let currentTexts = await getMockInterviewSpeechTexts(userId, userInterviewUuid);
    if (!currentTexts) currentTexts = [];

    currentTexts.push(...texts);
    currentTexts.sort((text, textB) => {
        if (text?.startTime !== textB?.startTime) return text.startTime - textB.startTime;
        return text?.segmentStartTime - textB?.segmentStartTime;
    });

    const key = `${MOCK_INTERVIEW_SPEECH_TEXTS_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.set(key, JSON.stringify(currentTexts), 'EX', 60);
};

const deleteMokInterviewSpeechTexts = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_SPEECH_TEXTS_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.del(key);
};

exports.setMockInterviewPauseJobCache = setMockInterviewPauseJobCache;
exports.getMockInterviewPauseJobCache = getMockInterviewPauseJobCache;
exports.isMockInterviewRunning = isMockInterviewRunning;
exports.deleteMockInterviewPauseJobCache = deleteMockInterviewPauseJobCache;
exports.setMockInterviewRespondJobCache = setMockInterviewRespondJobCache;
exports.getMockInterviewRespondJobCache = getMockInterviewRespondJobCache;
exports.deleteMockInterviewRespondJobCache = deleteMockInterviewRespondJobCache;
exports.getMockInterviewSpeechTexts = getMockInterviewSpeechTexts;
exports.saveMockInterviewSpeechTexts = saveMockInterviewSpeechTexts;
exports.deleteMockInterviewSpeechTexts = deleteMokInterviewSpeechTexts;

module.exports = exports;
