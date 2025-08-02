const openai = require('openai');

/**
 * @type {openai.OpenAI}
 */
let openAi;

const initializeOpenAiClient = () => {
    openAi = new openai.OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

const getOpenAiClient = () => {
    if (!openAi) throw new Error('OpenAI client not initialized');
    return openAi;
};

const callOpenAiCompletion = (body) => getOpenAiClient().chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.3,
    max_tokens: 16384,
    ...body
});

exports.initializeOpenAiClient = initializeOpenAiClient;
exports.getOpenAiClient = getOpenAiClient;
exports.callOpenAiCompletion = callOpenAiCompletion;

module.exports = exports;
