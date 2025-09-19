module.exports = (sequelize, DataTypes) => {
    const attributes = {
        // ... (your existing attributes remain the same)
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
        examPackageId: {
            type: DataTypes.INTEGER().UNSIGNED,
            allowNull: false,
            // Ensure this foreign key is set up correctly
        },
        masterCategoryId: {
            type: DataTypes.INTEGER().UNSIGNED,
            allowNull: false,
            // Ensure this foreign key is set up correctly
        }
    };

    const options = {
        // ... (your existing options remain the same)
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: 'exam_package_categories'
    };

    const ExamPackageCategory = sequelize.define('ExamPackageCategory', attributes, options);

    // Add this new associate method
    ExamPackageCategory.associate = (models) => {
        // Defines the relationship: ExamPackageCategory belongs to one ExamPackage
        ExamPackageCategory.belongsTo(models.ExamPackage, {
            foreignKey: 'examPackageId',
            as: 'exam_package'
        });

        // Defines the relationship: ExamPackageCategory belongs to one MasterCategory
        ExamPackageCategory.belongsTo(models.MasterCategory, {
            foreignKey: 'masterCategoryId',
            as: 'master_category'
        });
    };

    return ExamPackageCategory;
};
