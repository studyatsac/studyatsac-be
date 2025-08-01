const AiServiceSocket = require('../../clients/socket/ai_service');
const LogUtils = require('../../utils/logger');
const MockInterviewCacheUtils = require('../../utils/mock_interview_cache');
const MockInterviewConstants = require('../../constants/mock_interview');
const SocketServer = require('../../servers/socket/main');
const Queues = require('../../queues/bullmq');

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
            speakStatus
        };
        await MockInterviewCacheUtils.setMockInterviewStatus(userId, uuid, statusObject);

        const clientSid = await MockInterviewCacheUtils.getMockInterviewSid(userId, uuid);
        if (!clientSid) return;

        SocketServer.emitEventToClient(
            clientSid,
            MockInterviewConstants.EVENT_NAME.STATUS,
            statusObject
        );

        const jobId = await MockInterviewCacheUtils.getMockInterviewPauseJobId(userId, uuid);
        if (!jobId) return;

        const job = await Queues.MockInterviewControl.getJob(jobId);
        if (!job) return;

        if (await job.isDelayed()) {
            const timeLapsed = Date.now() - job.timestamp;
            await job.changeDelay(timeLapsed + MockInterviewConstants.MAX_IDLE_TIME_IN_MILLISECONDS);
        } else if (!(await job.isCompleted())) {
            await job.updateData({});
            await MockInterviewCacheUtils.deleteMockInterviewPauseJobId(userId, uuid);

            const newJob = await Queues.MockInterviewControl.add(
                MockInterviewConstants.JOB_NAME.PAUSE,
                { userId, userInterviewUuid: uuid },
                { delay: MockInterviewConstants.MAX_IDLE_TIME_IN_MILLISECONDS }
            );
            await MockInterviewCacheUtils.setMockInterviewPauseJobId(userId, uuid, newJob.id);
        }
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
