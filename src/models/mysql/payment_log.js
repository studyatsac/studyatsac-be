module.exports = (sequelize, DataTypes) => {
    const attributes = {
        id: {
            type: DataTypes.INTEGER().UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        uuid: {
            type: DataTypes.STRING(36),
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        provider: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER().UNSIGNED,
            allowNull: true
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        productId: {
            type: DataTypes.INTEGER().UNSIGNED,
            allowNull: true
        },
        externalProductId: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        externalProductName: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        externalTicketId: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        externalTicketName: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        examPackageId: {
            type: DataTypes.INTEGER().UNSIGNED,
            allowNull: true
        },
        essayPackageId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    };

    const options = {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: 'payment_logs'
    };

    const PaymentLog = sequelize.define('PaymentLog', attributes, options);

    return PaymentLog;
};
