const Models = require("../../models/mysql");

exports.getResourcesByQuestion = async function (questionId, opts = {}, trx = null) {
  const results = await Models.questions_resources.findAll({
    include: [
      {
        model: Models.Resources,
        as: 'resource',
        attributes: ['id', 'resource_name', 'type', 'source_link'],
      },
    ],
    where: { question_id: questionId },
    ...opts,
    transaction: trx
  });

  return results.map(item => item.resource).filter(Boolean);
};

// Ambil semua resource untuk array of questionIds
exports.getResourcesByQuestionIds = async function (questionIds, opts = {}, trx = null) {
  const results = await Models.questions_resources.findAll({
    include: [
      {
        model: Models.Resources,
        as: 'resource',
        attributes: ['id', 'resource_name', 'type', 'source_link'],
      },
    ],
    where: { question_id: questionIds },
    ...opts,
    transaction: trx
  });
  // Format: array of { question_id, resource: { ... } }
  return results.map(item => ({
    question_id: item.question_id,
    ...item.resource?.toJSON?.()
  })).filter(item => item.id);
};
