const Uuid = require('uuid');
const Cache = require('../clients/cache/main');
const MockInterviewConstants = require('../constants/mock_interview');

/**
 * 24 hours
 */
const MAX_TTL_MILLISECONDS = 24 * 60 * 60 * 1000;

const MOCK_INTERVIEW_PREFIX_KEY = 'mock_interview';
const MOCK_INTERVIEW_SESSION_PREFIX_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_session`;
const MOCK_INTERVIEW_SID_PREFIX_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_sid`;
const MOCK_INTERVIEW_STATUS_PREFIX_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_status`;
const MOCK_INTERVIEW_CONTROL_PAUSE_PREFIX_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_control_pause`;
const MOCK_INTERVIEW_CONTROL_STOP_PREFIX_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_control_stop`;
const MOCK_INTERVIEW_CONTROL_PAUSE_ID_PREFIX_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_control_pause_id`;
const MOCK_INTERVIEW_CONTROL_STOP_ID_PREFIX_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_control_stop_id`;
const MOCK_INTERVIEW_PROCESS_PREFIX_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_process`;
const MOCK_INTERVIEW_SCHEDULE_TIMER_PREFIX_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_schedule_timer`;
const MOCK_INTERVIEW_SCHEDULE_TIMER_LAST_UPDATE_PREFIX_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_schedule_timer_last_update`;
const MOCK_INTERVIEW_SPEECH_TEXTS_PREFIX_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_speech_texts`;
const MOCK_INTERVIEW_SPEECH_COUNTER_PREFIX_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_speech_counter`;
const MOCK_INTERVIEW_PROCESS_TARGET_PREFIX_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_process_target`;
const MOCK_INTERVIEW_PROCESS_INTERRUPT_FLAG_PREFIX_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_process_interrupt_flag`;
const MOCK_INTERVIEW_PROCESS_HISTORY_PREFIX_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_process_history`;

const setMockInterviewSessionId = async (userId, userInterviewUuid, sessionId) => {
    const key = `${MOCK_INTERVIEW_SESSION_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.setCache(key, sessionId, MockInterviewConstants.MAX_SESSION_TIME_IN_MILLISECONDS + (60 * 1000));
};

const generateMockInterviewSessionId = async (userId, userInterviewUuid) => {
    const sessionId = Uuid.v4();
    await setMockInterviewSessionId(userId, userInterviewUuid, sessionId);

    return sessionId;
};

const getMockInterviewSessionId = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_SESSION_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    return Cache.getCache(key);
};

const deleteMockInterviewSessionId = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_SESSION_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.deleteCache(key);
};

const isMockInterviewRunning = async (userId, userInterviewUuid) => !!(await getMockInterviewSessionId(userId, userInterviewUuid));

const getMockInterviewSid = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_SID_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    return Cache.getCache(key);
};

const setMockInterviewSid = async (userId, userInterviewUuid, sid) => {
    const key = `${MOCK_INTERVIEW_SID_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.setCache(key, sid, MockInterviewConstants.MAX_SESSION_TIME_IN_MILLISECONDS + (5 * 60 * 1000));
};

const deleteMockInterviewSid = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_SID_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.deleteCache(key);
};

const setMockInterviewStatus = async (userId, userInterviewUuid, status) => {
    const key = `${MOCK_INTERVIEW_STATUS_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.setCache(
        key,
        JSON.stringify(status),
        MockInterviewConstants.MAX_SESSION_TIME_IN_MILLISECONDS + (5 * 60 * 1000)
    );
};

const getMockInterviewStatus = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_STATUS_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    const status = await Cache.getCache(key);

    return status && JSON.parse(status);
};

const deleteMockInterviewStatus = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_STATUS_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.deleteCache(key);
};

const setMockInterviewControlPauseJobTime = async (userId, userInterviewUuid, jobTime) => {
    const key = `${MOCK_INTERVIEW_CONTROL_PAUSE_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.setCache(key, jobTime, MockInterviewConstants.MAX_IDLE_TIME_IN_MILLISECONDS + (5 * 60 * 1000));
};

const generateMockInterviewControlPauseJobTime = async (userId, userInterviewUuid) => {
    const targetTime = Date.now() + MockInterviewConstants.MAX_IDLE_TIME_IN_MILLISECONDS;
    await setMockInterviewControlPauseJobTime(userId, userInterviewUuid, targetTime);
    return targetTime;
};

const getMockInterviewControlPauseJobTime = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_CONTROL_PAUSE_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    return Number(await Cache.getCache(key)) || 0;
};

const deleteMockInterviewControlPauseJobTime = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_CONTROL_PAUSE_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.deleteCache(key);
};

const setMockInterviewControlPauseJobId = async (userId, userInterviewUuid, jobId) => {
    const key = `${MOCK_INTERVIEW_CONTROL_PAUSE_ID_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.setCache(key, jobId, MAX_TTL_MILLISECONDS);
};

const getMockInterviewControlPauseJobId = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_CONTROL_PAUSE_ID_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    return Cache.getCache(key);
};

const deleteMockInterviewControlPauseJobId = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_CONTROL_PAUSE_ID_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.deleteCache(key);
};

const setMockInterviewControlStopJobTime = async (userId, userInterviewUuid, time) => {
    const key = `${MOCK_INTERVIEW_CONTROL_STOP_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.setCache(key, time, 3 * 60 * 1000);
};

const generateMockInterviewControlStopJobTime = async (userId, userInterviewUuid) => {
    const targetTime = Date.now() + MockInterviewConstants.STOP_DELAY_TIME_IN_MILLISECONDS;
    await setMockInterviewControlStopJobTime(userId, userInterviewUuid, targetTime);
    return targetTime;
};

const getMockInterviewControlStopJobTime = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_CONTROL_STOP_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    return Number(await Cache.getCache(key)) || 0;
};

const deleteMockInterviewControlStopJobTime = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_CONTROL_STOP_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.deleteCache(key);
};

const setMockInterviewControlStopJobId = async (userId, userInterviewUuid, jobId) => {
    const key = `${MOCK_INTERVIEW_CONTROL_STOP_ID_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.setCache(key, jobId, MAX_TTL_MILLISECONDS);
};

const getMockInterviewControlStopJobId = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_CONTROL_STOP_ID_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    return Cache.getCache(key);
};

const deleteMockInterviewControlStopJobId = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_CONTROL_STOP_ID_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.deleteCache(key);
};

const setMockInterviewProcessJobId = async (userId, userInterviewUuid, jobId) => {
    const key = `${MOCK_INTERVIEW_PROCESS_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.setCache(key, jobId, MockInterviewConstants.PROCESS_TIME_IN_MILLISECONDS + (3 * 60 * 1000));
};

const getMockInterviewProcessJobId = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_PROCESS_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    return Cache.getCache(key);
};

const deleteMockInterviewProcessJobId = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_PROCESS_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.deleteCache(key);
};

const setMockInterviewScheduleTimerJobId = async (userId, userInterviewUuid, jobId) => {
    const key = `${MOCK_INTERVIEW_SCHEDULE_TIMER_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.setCache(key, jobId, MAX_TTL_MILLISECONDS);
};

const getMockInterviewScheduleTimerJobId = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_SCHEDULE_TIMER_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    return Cache.getCache(key);
};

const generateMockInterviewScheduleTimerJobId = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_SCHEDULE_TIMER_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await setMockInterviewScheduleTimerJobId(userId, userInterviewUuid, key);
    return key;
};

const deleteMockInterviewScheduleTimerJobId = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_SCHEDULE_TIMER_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.deleteCache(key);
};

const getMockInterviewScheduleTimerLastUpdate = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_SCHEDULE_TIMER_LAST_UPDATE_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    const data = await Cache.getCache(key);
    if (!data) return 0;

    return JSON.parse(data) || 0;
};

const setMockInterviewScheduleTimerLastUpdate = async (userId, userInterviewUuid, lastUpdate) => {
    const key = `${MOCK_INTERVIEW_SCHEDULE_TIMER_LAST_UPDATE_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    let targetLastUpdate = lastUpdate;
    if (!targetLastUpdate) targetLastUpdate = Date.now();

    await Cache.setCache(key, JSON.stringify(targetLastUpdate), MAX_TTL_MILLISECONDS);
};

const deleteMockInterviewScheduleTimerLastUpdate = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_SCHEDULE_TIMER_LAST_UPDATE_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
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

const getMockInterviewProcessTarget = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_PROCESS_TARGET_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    const data = await Cache.getCache(key);
    return data && JSON.parse(data);
};

const setMockInterviewProcessTarget = async (userId, userInterviewUuid, target) => {
    const key = `${MOCK_INTERVIEW_PROCESS_TARGET_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.setCache(
        key,
        JSON.stringify(target),
        MockInterviewConstants.MAX_SESSION_TIME_IN_MILLISECONDS + (5 * 60 * 1000)
    );
};

const deleteMockInterviewProcessTarget = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_PROCESS_TARGET_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.deleteCache(key);
};

const setMockInterviewProcessInterruptFlag = async (userId, userInterviewUuid, flag) => {
    const key = `${MOCK_INTERVIEW_PROCESS_INTERRUPT_FLAG_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.setCache(
        key,
        JSON.stringify(Boolean(flag)),
        MockInterviewConstants.MAX_SESSION_TIME_IN_MILLISECONDS + (5 * 60 * 1000)
    );
};

const getMockInterviewProcessInterruptFlag = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_PROCESS_INTERRUPT_FLAG_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    const flag = await Cache.getCache(key);
    return !!flag && Boolean(JSON.parse(flag));
};

const deleteMockInterviewProcessInterruptFlag = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_PROCESS_INTERRUPT_FLAG_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.deleteCache(key);
};

const setMockInterviewProcessHistory = async (userId, userInterviewUuid, history) => {
    const key = `${MOCK_INTERVIEW_PROCESS_HISTORY_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.setCache(key, JSON.stringify(history), MAX_TTL_MILLISECONDS);
};

const getMockInterviewProcessHistory = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_PROCESS_HISTORY_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    const history = await Cache.getCache(key);
    return history && JSON.parse(history);
};

const deleteMockInterviewProcessHistory = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_PROCESS_HISTORY_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.deleteCache(key);
};

exports.generateMockInterviewSessionId = generateMockInterviewSessionId;
exports.setMockInterviewSessionId = setMockInterviewSessionId;
exports.getMockInterviewSessionId = getMockInterviewSessionId;
exports.deleteMockInterviewSessionId = deleteMockInterviewSessionId;
exports.isMockInterviewRunning = isMockInterviewRunning;
exports.getMockInterviewSid = getMockInterviewSid;
exports.setMockInterviewSid = setMockInterviewSid;
exports.deleteMockInterviewSid = deleteMockInterviewSid;
exports.setMockInterviewStatus = setMockInterviewStatus;
exports.getMockInterviewStatus = getMockInterviewStatus;
exports.deleteMockInterviewStatus = deleteMockInterviewStatus;
exports.setMockInterviewControlPauseJobTime = setMockInterviewControlPauseJobTime;
exports.generateMockInterviewControlPauseJobTime = generateMockInterviewControlPauseJobTime;
exports.getMockInterviewControlPauseJobTime = getMockInterviewControlPauseJobTime;
exports.deleteMockInterviewControlPauseJobTime = deleteMockInterviewControlPauseJobTime;
exports.setMockInterviewControlPauseJobId = setMockInterviewControlPauseJobId;
exports.getMockInterviewControlPauseJobId = getMockInterviewControlPauseJobId;
exports.deleteMockInterviewControlPauseJobId = deleteMockInterviewControlPauseJobId;
exports.setMockInterviewControlStopJobTime = setMockInterviewControlStopJobTime;
exports.generateMockInterviewControlStopJobTime = generateMockInterviewControlStopJobTime;
exports.getMockInterviewControlStopJobTime = getMockInterviewControlStopJobTime;
exports.deleteMockInterviewControlStopJobTime = deleteMockInterviewControlStopJobTime;
exports.setMockInterviewControlStopJobId = setMockInterviewControlStopJobId;
exports.getMockInterviewControlStopJobId = getMockInterviewControlStopJobId;
exports.deleteMockInterviewControlStopJobId = deleteMockInterviewControlStopJobId;
exports.setMockInterviewProcessJobId = setMockInterviewProcessJobId;
exports.getMockInterviewProcessJobId = getMockInterviewProcessJobId;
exports.deleteMockInterviewProcessJobId = deleteMockInterviewProcessJobId;
exports.setMockInterviewScheduleTimerJobId = setMockInterviewScheduleTimerJobId;
exports.getMockInterviewScheduleTimerJobId = getMockInterviewScheduleTimerJobId;
exports.generateMockInterviewScheduleTimerJobId = generateMockInterviewScheduleTimerJobId;
exports.deleteMockInterviewScheduleTimerJobId = deleteMockInterviewScheduleTimerJobId;
exports.getMockInterviewScheduleTimerLastUpdate = getMockInterviewScheduleTimerLastUpdate;
exports.setMockInterviewScheduleTimerLastUpdate = setMockInterviewScheduleTimerLastUpdate;
exports.deleteMockInterviewScheduleTimerLastUpdate = deleteMockInterviewScheduleTimerLastUpdate;
exports.hasMockInterviewSpeechTexts = hasMockInterviewSpeechTexts;
exports.getMockInterviewSpeechTexts = getMockInterviewSpeechTexts;
exports.updateMockInterviewSpeechTexts = updateMockInterviewSpeechTexts;
exports.deleteMockInterviewSpeechTexts = deleteMokInterviewSpeechTexts;
exports.getMockInterviewSpeechCounter = getMockInterviewSpeechCounter;
exports.incrementMockInterviewSpeechCounter = incrementMockInterviewSpeechCounter;
exports.decrementMockInterviewSpeechCounter = decrementMockInterviewSpeechCounter;
exports.getMockInterviewProcessTarget = getMockInterviewProcessTarget;
exports.setMockInterviewProcessTarget = setMockInterviewProcessTarget;
exports.deleteMockInterviewProcessTarget = deleteMockInterviewProcessTarget;
exports.setMockInterviewProcessInterruptFlag = setMockInterviewProcessInterruptFlag;
exports.getMockInterviewProcessInterruptFlag = getMockInterviewProcessInterruptFlag;
exports.deleteMockInterviewProcessInterruptFlag = deleteMockInterviewProcessInterruptFlag;
exports.setMockInterviewProcessHistory = setMockInterviewProcessHistory;
exports.getMockInterviewProcessHistory = getMockInterviewProcessHistory;
exports.deleteMockInterviewProcessHistory = deleteMockInterviewProcessHistory;

module.exports = exports;
