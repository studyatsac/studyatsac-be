const MockInterviewService = require('../../../services/v1/mock_interview');

exports.speakMockInterview = async (client, uuid, data) => {
    const userId = client?.handshake?.auth?.user?.id;
    await MockInterviewService.speakMockInterview({
        uuid,
        userId,
        buffer: data,
        sid: client?.id
    });
};

module.exports = exports;
