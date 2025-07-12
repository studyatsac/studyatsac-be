const UserEssayListValidation = require('../../../validations/v1/user-essay/user_essay_list');
const UserEssayService = require('../../../services/v1/user_essay');
const UserEssayTransformer = require('../../../transformers/v1/user-essay/user_essay');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.getUserEssayList = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        let params;
        try {
            params = await UserEssayListValidation(lang).validateAsync(req.query);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        let input;
        if (params.essayUuid) {
            input = { essayUuid: params.essayUuid };
        }

        const result = await UserEssayService.getAllUserEssayAndCount(input, { lang, params });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: UserEssayTransformer.userEssayList(result.data.rows),
            message: '',
            meta: {
                page: params.page,
                limit: params.limit,
                totalData: result.data.count,
                totalPage: Math.ceil(result.data.count / params.limit)
            }
        });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'getUserEssayList',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
