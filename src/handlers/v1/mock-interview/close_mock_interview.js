const MockInterviewCacheUtils = require('../../../utils/mock_interview_cache');

exports.closeMockInterview = async (client, uuid) => {
    const userId = client?.handshake?.auth?.user?.id;
    if (!userId || !uuid) return;
    if (!await MockInterviewCacheUtils.isMockInterviewRunning(userId, uuid)) return;

    await MockInterviewCacheUtils.setMockInterviewControlStopJobTime(userId, uuid, Date.now() + 1000);
};

module.exports = exports;
