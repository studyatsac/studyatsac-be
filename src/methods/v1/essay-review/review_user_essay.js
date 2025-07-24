const UserEssayService = require('../../../services/v1/user_essay');
const UserEssayTransformer = require('../../../transformers/v1/user-essay/user_essay');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');
const EssayReviewValidation = require('../../../validations/v1/essay-review/essay_review');
const EssayReviewService = require('../../../services/v1/essay_review');

let lang;

exports.reviewUserEssay = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        let input;
        try {
            input = await EssayReviewValidation(lang).validateAsync(req.body);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        input.userId = req.session.id;
        if (!input.userId) {
            return res.status(404).json({ message: lang.USER_NOT_FOUND });
        }

        const essayPackageResult = await EssayReviewService.getPaidEssayReviewPackage(input, { lang });
        if (!essayPackageResult.status) {
            return res.status(essayPackageResult.code).json({ message: essayPackageResult.message });
        }
        const essayPackage = essayPackageResult.data;
        if ((essayPackage.itemMaxAttempt ?? 0) <= (essayPackage.currentAttempt ?? 0)) {
            return res.status(400).json({ message: lang.ESSAY_REVIEW.EXCEED_MAX_ATTEMPT });
        }

        input.essayPackageId = essayPackage.id;

        let withReview = false;
        if (input && input.withReview) {
            withReview = input.withReview;
            delete input.withReview;
        }

        const result = await UserEssayService.createUserEssay(
            input,
            { lang, isRestricted: true, withReview }
        );

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({ data: UserEssayTransformer.userEssayItem(result.data), message: lang.USER_ESSAY.CREATE_SUCCESS });
    } catch (err) {
        LogUtils.logError({
            functionName: 'reviewUserEssay',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
