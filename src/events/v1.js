const events = [];
const eventsLength = events.length;
const addEvent = (event, callback) => {
    if (eventsLength > 0) return;
    events.push({ event, callback });
};

addEvent('speech', require('../handlers/v1/mock-interview/speak_mock_interview').speakMockInterview);
addEvent('ping', require('../handlers/v1/mock-interview/ping_mock_interview').pingMockInterview);
addEvent('close', require('../handlers/v1/mock-interview/close_mock_interview').closeMockInterview);

module.exports = events;
