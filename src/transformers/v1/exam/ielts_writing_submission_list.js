exports.item = (data) => ({
    taskId: data.taskId,
    taskType: data.taskType,
    writingText: data.writingText,
    submittedAt: data.created_at || null
});

module.exports = exports;
