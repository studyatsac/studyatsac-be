const events = [];
const eventsLength = events.length;
const addEvent = (event, callback) => {
    if (eventsLength > 0) return;
    events.push({ event, callback });
};

addEvent('speak', require('../handlers/v1/mock-interview/speak_mock_interview').speakMockInterview);

module.exports = events;
