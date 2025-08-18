const MockInterviewCacheUtils = require('../../../utils/mock_interview_cache');

exports.pingMockInterview = async (client, uuid) => {
    const userId = client?.handshake?.auth?.user?.id;
    if (!userId || !uuid) return;
    if (!await MockInterviewCacheUtils.isMockInterviewRunning(userId, uuid)) return;

    await MockInterviewCacheUtils.setMockInterviewSid(userId, uuid, client?.id);
};

module.exports = exports;
