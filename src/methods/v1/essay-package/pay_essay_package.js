const Moment = require('moment');
const EssayPackageService = require('../../../services/v1/essay_package');
const UserPurchaseRepository = require('../../../repositories/mysql/user_purchase');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

// TODO: Remove this
// Demo purpose only
exports.payEssayPackage = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        const essayPackage = await EssayPackageService.getEssayPackage({ uuid: req.body.essayPackageUuid }, { lang });

        if (!essayPackage) {
            return res.status(404).json({ message: lang.ESSAY_PACKAGE.NOT_FOUND });
        }

        await UserPurchaseRepository.create({
            userId: req.session.id,
            essayPackageId: essayPackage.data.id,
            expiredAt: Moment().add(365, 'days').format()
        });

        return res.status(200).json({ message: 'Payment Success' });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'payEssayPackage',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
