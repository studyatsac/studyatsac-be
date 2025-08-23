const supabase = require('../../utils/supabase');
const Models = require('../../models/mysql');
const ResourceRepository = require('../../repositories/mysql/resources');

exports.getResourcesByQuestion = async function (questionId, opts = {}, trx = null) {
    const results = await Models.questions_resources.findAll({
        include: [

            {
                model: Models.Resources,
                as: 'resource',
                attributes: ['id', 'resource_name', 'type', 'source_link']
            }
        ],
        where: { question_id: questionId },
        ...opts,
        transaction: trx
    });

    return results.map((item) => item.resource).filter(Boolean);
};

exports.createResources = async function (input, opts = {}) {
    if (!input.resources) throw new Error('No resources provided');

    const fileName = `${Date.now()}-${input.resource_name}`;

    const { error } = await supabase.storage
        .from('my-uploads')
        .upload(`resources/${fileName}`, input.resources.buffer, {
            contentType: input.resources.mimetype
        });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
        .from('my-uploads')
        .getPublicUrl(`resources/${fileName}`);

    const resource = await ResourceRepository.create({
        resource_name: input.resource_name,
        type: input.type,
        source_link: publicUrlData.publicUrl
    });

    return resource;
};
