const UserEssayListValidation = require('../../../validations/v1/user-essay/user_essay_list');
const UserEssayService = require('../../../services/v1/user_essay');
const UserEssayTransformer = require('../../../transformers/v1/user-essay/user_essay');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.getSpecificUserEssayList = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        let input;
        try {
            input = await UserEssayListValidation(lang).validateAsync(req.query);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        const result = await UserEssayService.getAllUserEssayAndCount(
            { userId: req.session.id, ...(input.essayUuid && { essayUuid: input.essayUuid }) },
            { lang, params: input }
        );

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: UserEssayTransformer.userEssayList(result.rows),
            message: '',
            meta: {
                page: input.page,
                limit: input.limit,
                totalData: result.count,
                totalPage: Math.ceil(result.count / input.limit)
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
