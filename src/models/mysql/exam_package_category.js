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
        examPackageId: {
            type: DataTypes.INTEGER().UNSIGNED,
            allowNull: false
        },
        masterCategoryId: {
            type: DataTypes.INTEGER().UNSIGNED,
            allowNull: false
        }
    };

    const options = {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: 'exam_package_categories'
    };

    const ExamPackageCategory = sequelize.define('ExamPackageCategory', attributes, options);

    return ExamPackageCategory;
};
