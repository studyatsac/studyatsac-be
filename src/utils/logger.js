const logError = (...params) => {
    // TODO: Logging to file
    console.error(new Date(), ...params);
};

const logDebug = (...params) => {
    // TODO: Logging to file
    console.log(new Date(), ...params);
};

exports.logError = logError;
exports.logDebug = logDebug;

module.exports = exports;
