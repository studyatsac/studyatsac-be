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
        }
    };

    const options = {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: 'products'
    };

    const Product = sequelize.define('Product', attributes, options);

    Product.associate = (models) => {
        Product.belongsTo(models.ExamPackage, {
            targetKey: 'id',
            sourceKey: 'exam_package_id'
        });
        Product.belongsTo(models.EssayPackage, {
            targetKey: 'id',
            sourceKey: 'essay_package_id',
            onDelete: 'CASCADE',
            as: 'essayPackage'
        });
    };

    return Product;
};
