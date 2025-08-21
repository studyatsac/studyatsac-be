const supabase = require('@supabase/supabase-js');
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
    if (!input.file) throw new Error('No file provided');

    const fileName = `${Date.now()}-${input.file.originalname}`;

    const { error } = await supabase.storage
        .from('my-bucket')
        .upload(`resources/${fileName}`, input.file.buffer, {
            contentType: input.file.mimetype
        });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
        .from('my-bucket')
        .getPublicUrl(`resources/${fileName}`);

    const resource = await ResourceRepository.create({
        resource_name: input.file.resourceName,
        type: input.type,
        source_link: publicUrlData.publicUrl
    });

    return resource;
};
