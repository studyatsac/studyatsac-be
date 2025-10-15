const Models = require('../../models/mysql');

exports.create = async function (scholarshipData, detailData, trx = null) {
    const scholarship = await Models.Scholarships.create(scholarshipData, { transaction: trx });

    detailData.scholarship_id = scholarship.uuid;

    await Models.ScholarshipDetails.create(detailData, { transaction: trx });

    return scholarship;
};

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.Scholarships.findOne({
        where,
        include: [{
            model: Models.ScholarshipDetails,
            as: 'details'
        }],
        ...opts,
        transaction: trx
    });
};

exports.findAndCountAll = function (where, opts = {}, trx = null) {
    return Models.Scholarships.findAndCountAll({
        where,
        include: [{
            model: Models.ScholarshipDetails,
            as: 'details'
        }],
        ...opts,
        transaction: trx
    });
};

exports.update = function (payload, where, trx = null) {
    return Models.Scholarships.update(payload, { where, transaction: trx });
};

exports.updateDetails = function (payload, where, trx = null) {
    return Models.ScholarshipDetails.update(payload, { where, transaction: trx });
};

exports.delete = function (where, trx = null) {
    return Models.Scholarships.destroy({ where, transaction: trx });
};

module.exports = exports;
