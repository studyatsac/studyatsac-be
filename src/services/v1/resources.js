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

// exports.createResources = async function (input, opts = {}) {
//     if (!input.resources) throw new Error('No resources provided');
//
//     const fileName = `${Date.now()}-${input.resource_name}`;
//
//     const { error } = await supabase.storage
//         .from('my-uploads')
//         .upload(`resources/${fileName}`, input.resources.buffer, {
//             contentType: input.resources.mimetype
//         });
//
//     if (error) throw error;
//
//     const { data: publicUrlData } = supabase.storage
//         .from('my-uploads')
//         .getPublicUrl(`resources/${fileName}`);
//
//     const resource = await ResourceRepository.create({
//         resource_name: input.resource_name,
//         type: input.type,
//         source_link: publicUrlData.publicUrl
//     });
//
//     return resource;
// };
exports.createResources = async function (input, opts = {}) {
    // Pastikan properti 'resources' ada dan merupakan file yang valid
    if (!input.resources || !input.resources.buffer || !input.resources.mimetype || !input.resources.originalname) {
        throw new Error('No valid file provided. Please ensure the uploaded file has a buffer, mimetype, and originalname.');
    }

    // Ambil nama file asli dari input.resources jika ada
    const originalFileName = input.resources.originalname || `file-${Date.now()}`;
    const fileExtension = originalFileName.split('.').pop();
    const fileName = `${Date.now()}-${originalFileName.replace(/[^a-zA-Z0-9.]/g, '_')}`; // sanitasi nama file
    const filePath = `resources/${fileName}`;

    // Tentukan tipe file berdasarkan mimetype
    let fileType = 'unknown';
    if (input.resources.mimetype.startsWith('image/')) {
        fileType = 'image';
    } else if (input.resources.mimetype.startsWith('video/')) {
        fileType = 'video';
    } else if (input.resources.mimetype.startsWith('audio/')) {
        fileType = 'audio';
    } else if (input.resources.mimetype === 'application/pdf') {
        fileType = 'document';
    }

    try {
        // Unggah file ke Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('my-uploads')
            .upload(filePath, input.resources.buffer, {
                contentType: input.resources.mimetype
            });

        if (uploadError) {
            console.error('Upload Error:', uploadError);
            throw new Error(`Failed to upload file to storage: ${uploadError.message}`);
        }

        // Dapatkan URL publik dari file yang diunggah
        const { data: publicUrlData } = supabase.storage
            .from('my-uploads')
            .getPublicUrl(filePath);

        if (!publicUrlData || !publicUrlData.publicUrl) {
            throw new Error('Failed to get public URL for the uploaded file.');
        }

        // Buat entri di database dengan nama dan tipe yang ditentukan secara otomatis
        const resource = await ResourceRepository.create({
            resource_name: originalFileName,
            type: fileType,
            source_link: publicUrlData.publicUrl
        });

        return resource;
    } catch (err) {
        console.error('Error in createResources:', err);
        throw err;
    }
};
