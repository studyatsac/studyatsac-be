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
            allowNull: false
        },
        examPackageId: {
            type: DataTypes.INTEGER().UNSIGNED,
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
    };

    return Product;
};
