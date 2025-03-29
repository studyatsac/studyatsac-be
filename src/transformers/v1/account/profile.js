exports.item = (data) => ({
    fullName: data.fullName,
    email: data.email,
    institutionName: data.institutionName || null,
    faculty: data.faculty || null,
    nip: data.nip || null,
    ieltsScore: data.IeltsScore?.overallScore || null,
    readingScore: data.IeltsScore?.readingScore || null,
    listeningScore: data.IeltsScore?.listeningScore || null
});

module.exports = exports;
