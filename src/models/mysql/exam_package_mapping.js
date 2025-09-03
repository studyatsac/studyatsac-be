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
        examId: {
            type: DataTypes.INTEGER().UNSIGNED,
            allowNull: false
        }
    };

    const options = {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: 'exam_package_mappings'
    };

    const ExamPackageMapping = sequelize.define('ExamPackageMapping', attributes, options);

    ExamPackageMapping.associate = (models) => {
        ExamPackageMapping.belongsTo(models.Exam, {
            targetKey: 'id',
            foreignKey: 'examId',
            as: 'exam'
        });
        ExamPackageMapping.belongsTo(models.ExamPackage, {
            targetKey: 'id',
            foreignKey: 'examPackageId',
            as: 'exam_package'
        });
    };

    return ExamPackageMapping;
};
