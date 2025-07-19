module.exports = (sequelize, DataTypes) => {
    const attributes = {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        uuid: {
            type: DataTypes.UUID,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        productPackageId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        essayId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true
        },
        interviewId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true
        },
        maxAttempt: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0
        }
    };

    const options = {
        timestamps: true,
        paranoid: true,
        underscored: true,
        tableName: 'product_package_mappings'
    };

    const ProductPackageMapping = sequelize.define('ProductPackageMapping', attributes, options);

    ProductPackageMapping.associate = (models) => {
        ProductPackageMapping.belongsTo(models.ProductPackage, {
            targetKey: 'id',
            foreignKey: 'product_package_id'
        });
        ProductPackageMapping.belongsTo(models.Essay, {
            targetKey: 'id',
            foreignKey: 'essay_id',
            as: 'essay'
        });
        ProductPackageMapping.belongsTo(models.Interview, {
            targetKey: 'id',
            foreignKey: 'interview_id',
            as: 'interview'
        });
    };

    return ProductPackageMapping;
};
