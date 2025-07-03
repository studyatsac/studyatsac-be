const UserEssayRepository = require('../../repositories/mysql/user_essay');
const Response = require('../../utils/response');
const Models = require('../../models/mysql');
const Helpers = require('../../utils/helpers');

const getUserEssay = async (input, opts = {}) => {
    const language = opts.lang;

    const essay = await UserEssayRepository.findOne(
        { uuid: input.uuid },
        {
            include: [
                { model: Models.User, as: 'user' },
                { model: Models.Essay, as: 'essay' },
                { model: Models.UserEssayItem, as: 'essayItems' }
            ]
        }
    );
    if (!essay) {
        return Response.formatServiceReturn(false, 404, null, language.USER_ESSAY.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, essay, null);
};

const getAllUserEssayAndCount = async (input, opts = {}) => {
    const language = opts.lang;

    const allUserEssay = await UserEssayRepository.findAndCountAll(
        input,
        {
            include: [
                { model: Models.User, as: 'user' },
                { model: Models.Essay, as: 'essay' }
            ],
            order: [['created_at', 'desc']],
            limit: input.limit,
            offset: Helpers.setOffset(input.page, input.limit)
        }
    );

    if (!allUserEssay) {
        return Response.formatServiceReturn(false, 404, null, language.USER_ESSAY.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, allUserEssay, null);
};

exports.getUserEssay = getUserEssay;
exports.getAllUserEssayAndCount = getAllUserEssayAndCount;

module.exports = exports;
