const { emitSpeechEvent } = require('../../../clients/socket/ai_service');

exports.speakMockInterview = async (client, userInterviewUuid, data) => {
    emitSpeechEvent(userInterviewUuid, data);
};

module.exports = exports;
