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
        }
    };

    const options = {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: 'free_exam_packages'
    };

    const FreeExamPackage = sequelize.define('FreeExamPackage', attributes, options);

    FreeExamPackage.associate = (models) => {
        FreeExamPackage.belongsTo(models.ExamPackage, {
            targetKey: 'id',
            foreignKey: 'exam_package_id'
        });
    };

    return FreeExamPackage;
};
