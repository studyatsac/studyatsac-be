exports.item = (data) => ({
    uuid: data.uuid,
    title: data.title,
    description: data.description,
    imageUrl: data.imageUrl,
    price: data.price,
    additionalInformation: data.additionalInformation,
    isPurchased: data?.UserPurchases?.length > 0
});

module.exports = exports;
