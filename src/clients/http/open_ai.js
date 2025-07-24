const OpenAI = require('openai');

let openAi;
if (!openAi) {
    openAi = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const callOpenAiCompletion = (body) => openAi?.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.3,
    max_tokens: 16384,
    ...body
});

exports.openAiClient = openAi;
exports.callOpenAiCompletion = callOpenAiCompletion;

module.exports = exports;
