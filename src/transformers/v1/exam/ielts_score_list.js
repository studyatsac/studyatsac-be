exports.item = (data) => ({
    taskId: data.taskId,
    score: data.overallScore,
    readingScore: data.readingScore || null,
    listeningScore: data.listeningScore || null,
    submittedAt: data.created_at || null
});

module.exports = exports;
