const Moment = require('moment');
const UserRepository = require('../../repositories/mysql/user');
const ProductRepository = require('../../repositories/mysql/product');
const UserPurchaseRepository = require('../../repositories/mysql/user_purchase');
const PaymentLogRepository = require('../../repositories/mysql/payment_log');
const Config = require('../../constants/webhook_payment');
const Response = require('../../utils/response');

const insertPaymentLog = async (input) => {
    const payload = {
        provider: input.provider,
        userId: input.user?.id || null,
        email: input.user.email,
        productId: input.product?.id || null,
        externalProductId: input.product?.externalProductId || null,
        examPackageId: input.examPackage?.id || null,
        metadata: input.paymentLog,
        status: input.status,
        notes: input.notes
    };

    await PaymentLogRepository.create(payload);
};

const handleProductPayment = async (input, opts = {}) => {
    const language = opts.lang;
    const data = input.data;
    let responseData = {
        examPackage: null,
        paymentLog: data,
        user: null,
        product: null
    };

    const user = await UserRepository.findOne({ email: data.customerEmail });

    if (!user) {
        return Response.formatServiceReturn(false, 200, responseData, language.USER_NOT_FOUND);
    }

    responseData.user = user.toJSON();

    const product = await ProductRepository.findOneWithExamPackage({ externalProductId: data.productId });

    if (!product) {
        return Response.formatServiceReturn(false, 200, responseData, language.PRODUCT_NOT_FOUND);
    }

    const { ExamPackage, ...productObject } = product.toJSON();

    responseData = {
        ...responseData,
        examPackage: ExamPackage,
        product: productObject
    };

    return Response.formatServiceReturn(true, 200, responseData, null);
};

const handleWebhookPayment = async (input, opts = {}) => {
    const language = opts.lang;
    const paymentLog = {
        provider: input.pg,
        paymentLog: input.data,
        status: 'fail',
        notes: null
    };

    if (input.pg !== Config.WEBHOOK_PAYMENT_MAYAR) {
        return Response.formatServiceReturn(true, 200, null, language.PAYMENT_STATUS_NOT_SUCCESS);
    }

    const paymentStatus = input.data.status?.toLowerCase();

    if (paymentStatus !== Config.WEBHOOK_PAYMENT_STATUS_SUCCESS) {
        paymentLog.notes = language.PAYMENT_STATUS_NOT_SUCCESS;
        paymentLog.user = {
            id: null,
            email: input.data.customerEmail
        };
        paymentLog.externalProductId = input.data.productId;

        await insertPaymentLog(paymentLog);
        return Response.formatServiceReturn(true, 200, null, language.PAYMENT_STATUS_NOT_SUCCESS);
    }

    const productPaymentResult = await handleProductPayment(input, opts);

    if (!productPaymentResult.status) {
        paymentLog.notes = productPaymentResult.message;
        paymentLog.user = {
            id: null,
            email: input.data.customerEmail,
            ...(productPaymentResult.data?.user || {})
        };
        paymentLog.product = { externalProductId: input.data.productId };

        await insertPaymentLog(paymentLog);

        productPaymentResult.status = true;

        return productPaymentResult;
    }

    const paymentData = productPaymentResult.data;

    if (!paymentData) {
        paymentLog.notes = language.UNPROCESS_ENTITY;
        paymentLog.user = {
            id: null,
            email: input.data.customerEmail
        };

        await insertPaymentLog(paymentLog);
        return Response.formatServiceReturn(true, 200, null, language.UNPROCESS_ENTITY);
    }

    const activeExamPackage = await UserPurchaseRepository.findOneExcludeExpired({
        userId: paymentData.user.id,
        examPackageId: paymentData.examPackage.id
    });

    if (activeExamPackage) {
        paymentLog.notes = 'Exam package still active';
        paymentLog.user = {
            id: null,
            email: input.data.customerEmail,
            ...(paymentData?.user || {})
        };
        paymentLog.product = {
            ...paymentData.product
        };

        paymentLog.examPackage = {
            ...paymentData.examPackage
        };

        await insertPaymentLog(paymentLog);
        return Response.formatServiceReturn(true, 200, null, 'Exam package still active');
    }

    const userPurchasePayload = {
        userId: paymentData.user.id,
        examPackageId: paymentData.examPackage.id,
        expiredAt: Moment().add(365, 'days').format()
    };

    const userPurchased = await UserPurchaseRepository.create(userPurchasePayload);

    paymentLog.user = {
        id: null,
        email: input.data.customerEmail,
        ...(paymentData?.user || {})
    };
    paymentLog.product = {
        ...paymentData.product
    };

    paymentLog.examPackage = {
        ...paymentData.examPackage
    };

    paymentLog.status = 'success';

    await insertPaymentLog(paymentLog);

    // insert hots package
    const userHaveHotsPackage = await UserPurchaseRepository.findOneExcludeExpired({
        userId: paymentData.user.id,
        examPackageId: process.env.HOTS_PACKAGE_ID
    });

    if (!userHaveHotsPackage) {
        await UserPurchaseRepository.create({
            userId: paymentData.user.id,
            examPackageId: process.env.HOTS_PACKAGE_ID,
            expiredAt: Moment().add(365, 'days').format()
        });
    }

    return Response.formatServiceReturn(true, 200, userPurchased, null);
};

exports.handleWebhookPayment = handleWebhookPayment;

module.exports = exports;
