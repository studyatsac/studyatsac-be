const AiServiceSocket = require('../../clients/socket/ai_service');
const LogUtils = require('../../utils/logger');
const MockInterviewCacheUtils = require('../../utils/mock_interview_cache');
const MockInterviewConstants = require('../../constants/mock_interview');
const SocketServer = require('../../servers/socket/main');

const listenStatusEvent = async (data) => {
    try {
        const {
            userId,
            uuid,
            status,
            listenStatus,
            transcribeStatus,
            processStatus,
            speakStatus
        } = data;
        if (!(await MockInterviewCacheUtils.isMockInterviewRunning(userId, uuid))) return;

        await MockInterviewCacheUtils.setMockInterviewStatus(userId, uuid, {
            status,
            listenStatus,
            transcribeStatus,
            processStatus,
            speakStatus
        });

        const clientSid = await MockInterviewCacheUtils.getMockInterviewSid(userId, uuid);
        if (!clientSid) return;

        SocketServer.emitEventToClient(clientSid, MockInterviewConstants.SOCKET_EVENT_NAME.STATUS, status);
    } catch (err) {
        LogUtils.logError({ functionName: 'listenStatusEvent', message: err.message });
    }
};

module.exports = () => {
    const listeners = [listenStatusEvent];

    const unsubscribeAll = AiServiceSocket.subscribeAiServiceEvent(
        MockInterviewConstants.AI_SERVICE_EVENT_NAME.SERVER_TEXT,
        (...params) => {
            listeners.forEach((listener) => listener(...params));
        }
    );

    const listen = (callback) => listeners.push(callback);

    return {
        name: 'MockInterviewStatus',
        listen,
        unsubscribeAll
    };
};
