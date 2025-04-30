// Transformer khusus untuk response admin exam package
exports.item = (data) => ({
    id: data.id,
    uuid: data.uuid,
    title: data.title,
    description: data.description,
    imageUrl: data.imageUrl,
    price: data.price,
    additionalInformation: data.additionalInformation,
    isPrivate: data.isPrivate,
    created_at: data.created_at,
    updated_at: data.updated_at
});

module.exports = exports;
