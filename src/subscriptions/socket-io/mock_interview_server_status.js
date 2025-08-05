const AiServiceSocket = require('../../clients/socket/ai_service');
const LogUtils = require('../../utils/logger');
const MockInterviewCacheUtils = require('../../utils/mock_interview_cache');
const MockInterviewConstants = require('../../constants/mock_interview');
const SocketServer = require('../../servers/socket/main');

const listenServerStatusEvent = async (data) => {
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

        const statusObject = {
            status,
            listenStatus,
            transcribeStatus,
            processStatus,
            speakStatus,
            tag: data?.tag
        };
        await MockInterviewCacheUtils.setMockInterviewStatus(userId, uuid, statusObject);

        const clientSid = await MockInterviewCacheUtils.getMockInterviewSid(userId, uuid);
        if (!clientSid) return;

        SocketServer.emitEventToClient(
            clientSid,
            MockInterviewConstants.EVENT_NAME.STATUS,
            statusObject
        );

        if (
            listenStatus !== MockInterviewConstants.STATUS.LISTENING
             && transcribeStatus !== MockInterviewConstants.STATUS.TRANSCRIBING
             && speakStatus !== MockInterviewConstants.STATUS.SPEAKING
            && processStatus !== MockInterviewConstants.STATUS.PROCESSING
        ) {
            return;
        }

        const pauseJobTime = await MockInterviewCacheUtils.getMockInterviewControlPauseJobTime(userId, uuid);
        if (!pauseJobTime) return;

        await MockInterviewCacheUtils.generateMockInterviewControlPauseJobTime(userId, uuid);
    } catch (err) {
        LogUtils.logError({ functionName: 'listenServerStatusEvent', message: err.message });
    }
};

module.exports = () => {
    const listeners = [listenServerStatusEvent];

    const unsubscribeAll = AiServiceSocket.subscribeAiServiceEvent(
        MockInterviewConstants.AI_SERVICE_EVENT_NAME.SERVER_STATUS,
        (...params) => {
            listeners.forEach((listener) => listener(...params));
        }
    );

    const listen = (callback) => listeners.push(callback);

    return {
        name: 'MockInterviewServerStatus',
        listen,
        unsubscribeAll
    };
};
