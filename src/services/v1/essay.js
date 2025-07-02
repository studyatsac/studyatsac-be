const EssayRepository = require('../../repositories/mysql/essay');
const Response = require('../../utils/response');

exports.getAllEssay = async (input, opts = {}) => {
    const language = opts.lang;

    const allEssay = await EssayRepository.findAll();

    if (!allEssay) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY_NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, allEssay.toJSON(), null);
};

exports.getAllActiveEssay = async (input, opts = {}) => {
    const language = opts.lang;

    const allActiveEssay = await EssayRepository.findAll({ isActive: true });

    if (!allActiveEssay) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY_NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, allActiveEssay.toJSON(), null);
};

module.exports = exports;
