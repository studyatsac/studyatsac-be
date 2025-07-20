const Moment = require('moment');
const UserRepository = require('../../repositories/mysql/user');
const ProductRepository = require('../../repositories/mysql/product');
const UserPurchaseRepository = require('../../repositories/mysql/user_purchase');
const PaymentLogRepository = require('../../repositories/mysql/payment_log');
const Config = require('../../constants/webhook_payment');
const Response = require('../../utils/response');
const Models = require('../../models/mysql');
const LogUtils = require('../../utils/logger');

const insertPaymentLog = async (input) => {
    try {
        const payloads = input.productAndAmounts.map((item) => ({
            provider: input.provider,
            userId: input.user?.id || null,
            email: input.user.email,
            productId: item.product?.id || null,
            externalProductId: item.product?.externalProductId || null,
            externalProductName: item.product?.externalProductName || null,
            externalTicketId: item.product?.externalTicketId || null,
            externalTicketName: item.product?.externalTicketName || null,
            examPackageId: item.product?.ExamPackage?.id || null,
            productPackageId: item.product?.productPackage?.id || null,
            metadata: input.paymentLog,
            status: input.status,
            notes: input.notes
        }));

        await PaymentLogRepository.createMany(payloads);
    } catch (err) {
        LogUtils.loggingError({ functionName: 'insertPaymentLog', message: err.message });
    }
};

const handleProductPayment = async (input, opts = {}) => {
    const language = opts.lang;
    const data = input.data;
    let productAndAmounts = [];
    let responseData = { productAndAmounts, paymentLog: data, user: null };

    const user = await UserRepository.findOne({ email: data.customerEmail });

    if (!user) {
        return Response.formatServiceReturn(false, 200, responseData, language.USER_NOT_FOUND);
    }

    responseData.user = user.toJSON();

    const isValidProduct = !!(data.productId || data.productName);
    if (isValidProduct && data.ticketHistory && Array.isArray(data.ticketHistory)) {
        const whereClauseConditions = data.ticketHistory.map((item) => {
            const hasValidTicket = !!(item.ticketId || item.ticketName);
            if (!hasValidTicket) return null;

            return {
                [Models.Op.or]: [
                    {
                        externalProductId: data.productId,
                        externalProductName: data.productName,
                        externalTicketId: item.ticketId,
                        externalTicketName: item.ticketName
                    },
                    {
                        externalProductId: data.productId,
                        [Models.Op.or]: [
                            { externalProductName: '' },
                            { externalProductName: { [Models.Op.is]: null } }
                        ],
                        externalTicketId: item.ticketId,
                        [Models.Op.or]: [
                            { externalTicketName: '' },
                            { externalTicketName: { [Models.Op.is]: null } }
                        ]
                    },
                    {
                        externalProductId: data.productId,
                        [Models.Op.or]: [
                            { externalProductName: '' },
                            { externalProductName: { [Models.Op.is]: null } }
                        ],
                        [Models.Op.or]: [
                            { externalTicketId: '' },
                            { externalTicketId: { [Models.Op.is]: null } }
                        ],
                        externalTicketName: item.ticketName
                    },
                    {
                        [Models.Op.or]: [
                            { externalProductId: '' },
                            { externalProductId: { [Models.Op.is]: null } }
                        ],
                        externalProductName: data.productName,
                        externalTicketId: item.ticketId,
                        [Models.Op.or]: [
                            { externalTicketName: '' },
                            { externalTicketName: { [Models.Op.is]: null } }
                        ]
                    },
                    {
                        [Models.Op.or]: [
                            { externalProductId: '' },
                            { externalProductId: { [Models.Op.is]: null } }
                        ],
                        externalProductName: data.productName,
                        [Models.Op.or]: [
                            { externalTicketId: '' },
                            { externalTicketId: { [Models.Op.is]: null } }
                        ],
                        externalTicketName: item.ticketName
                    }
                ]
            };
        }).filter(Boolean);

        const products = await ProductRepository.findAllWithPackage({ [Models.Op.or]: whereClauseConditions });
        if (products && products.length) {
            productAndAmounts = products.map((product) => {
                const ticket = data.ticketHistory.find(
                    (item) => item.ticketId === product.externalTicketId
                        || item.ticketName === product.externalTicketName
                );

                return { product, amount: ticket.amount || 0 };
            });
        }
    }
    if (isValidProduct && !productAndAmounts.length) {
        const product = await ProductRepository.findOneWithPackage({
            [Models.Op.or]: [
                {
                    externalProductId: data.productId,
                    externalProductName: data.productName
                },
                {
                    externalProductId: data.productId,
                    [Models.Op.or]: [
                        { externalProductName: '' },
                        { externalProductName: { [Models.Op.is]: null } }
                    ]
                },
                {
                    [Models.Op.or]: [
                        { externalProductId: '' },
                        { externalProductId: { [Models.Op.is]: null } }
                    ],
                    externalProductName: data.productName
                }
            ]
        });
        if (product) { productAndAmounts = [{ product, amount: data.amount }]; }
    }

    if (!productAndAmounts.length) {
        return Response.formatServiceReturn(false, 200, responseData, language.PRODUCT_NOT_FOUND);
    }

    responseData = { ...responseData, productAndAmounts };

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
        paymentLog.productAndAmounts = [{ externalProductId: input.data.productId }];

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

    const existedProductAndAmounts = [];
    const pendingPromises = paymentData.productAndAmounts.map(async (item) => {
        if (item.product?.ExamPackage) {
            const activeExamPackage = await UserPurchaseRepository.findOneExcludeExpired({
                userId: paymentData.user.id,
                examPackageId: paymentData.examPackage.id
            });
            if (activeExamPackage) {
                existedProductAndAmounts.push(item);
                return null;
            }
        } else if (item.product?.productPackage && input?.data?.transactionId) {
            const productPackage = await UserPurchaseRepository.findOne({
                userId: paymentData.user.id,
                productPackageId: item.product.productPackage.id,
                externalTransactionId: input.data.transactionId
            });
            if (productPackage) {
                existedProductAndAmounts.push(item);
                return null;
            }
        }

        return item;
    });
    const filteredProductAndAmounts = (await Promise.all(pendingPromises)).filter(Boolean);

    if (existedProductAndAmounts.length) {
        paymentLog.notes = 'Package still active/already inserted';
        paymentLog.user = {
            id: null,
            email: input.data.customerEmail,
            ...(paymentData?.user || {})
        };
        paymentLog.productAndAmounts = existedProductAndAmounts;

        await insertPaymentLog(paymentLog);

        if (!filteredProductAndAmounts.length) return Response.formatServiceReturn(true, 200, null, paymentLog.notes);
    }

    const notInsertedProductAndAmounts = [];
    const insertingProductAndAmounts = [];
    const userPurchasePayloads = filteredProductAndAmounts.map((item) => {
        if (item.product?.ExamPackage) {
            insertingProductAndAmounts.push(item);

            return {
                userId: paymentData.user.id,
                examPackageId: item.product?.ExamPackage?.id,
                expiredAt: Moment().add(365, 'days').format()
            };
        }
        if (item.product?.productPackage && input?.data?.transactionId) {
            insertingProductAndAmounts.push(item);

            return {
                userId: paymentData.user.id,
                productPackageId: item.product?.productPackage?.id,
                externalTransactionId: input?.data?.transactionId,
                expiredAt: Moment().add(365, 'days').format()
            };
        }

        notInsertedProductAndAmounts.push(item);

        return null;
    }).filter(Boolean);

    if (notInsertedProductAndAmounts.length) {
        paymentLog.notes = 'Data not inserted';
        paymentLog.user = {
            id: null,
            email: input.data.customerEmail,
            ...(paymentData?.user || {})
        };
        paymentLog.productAndAmounts = notInsertedProductAndAmounts;

        await insertPaymentLog(paymentLog);
    }
    if (!userPurchasePayloads.length) return Response.formatServiceReturn(true, 200, null, 'Data not inserted');

    const userPurchased = await UserPurchaseRepository.createMany(userPurchasePayloads);

    paymentLog.user = {
        id: null,
        email: input.data.customerEmail,
        ...(paymentData?.user || {})
    };
    paymentLog.productAndAmounts = insertingProductAndAmounts;

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
