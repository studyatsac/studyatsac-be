const UserEssayListValidation = require('../../../validations/v1/user-essay/user_essay_list');
const UserEssayService = require('../../../services/v1/user_essay');
const UserEssayTransformer = require('../../../transformers/v1/user-essay/user_essay');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.getSpecificUserEssayList = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        let params;
        try {
            params = await UserEssayListValidation(lang).validateAsync(req.query);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        const input = { userId: req.session.id };
        if (!input.userId) {
            return res.status(404).json({ message: lang.USER_NOT_FOUND });
        }

        if (params.essayUuid) {
            input.essayUuid = params.essayUuid;
        }

        const result = await UserEssayService.getAllUserEssayAndCount(input, { lang, params });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: UserEssayTransformer.userEssayList(result.rows),
            message: '',
            meta: {
                page: params.page,
                limit: params.limit,
                totalData: result.count,
                totalPage: Math.ceil(result.count / params.limit)
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
