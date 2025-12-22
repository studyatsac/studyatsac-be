module.exports = (sequelize, DataTypes) => {
    const attributes = {
        id: {
            type: DataTypes.INTEGER().UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        certificateId: {
            type: DataTypes.STRING(36),
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
            unique: true,
            field: 'certificate_id'
        },
        userId: {
            type: DataTypes.INTEGER().UNSIGNED,
            allowNull: false,
            field: 'user_id'
        },
        examId: {
            type: DataTypes.INTEGER().UNSIGNED,
            allowNull: false,
            field: 'exam_id'
        },
        certificateType: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'certificate_type'
        },
        certificateNumber: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'certificate_number'
        },
        issuedDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            field: 'issued_date'
        },
        testDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            field: 'test_date'
        },
        validUntil: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            field: 'valid_until'
        },
        listeningScore: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'listening_score'
        },
        structureScore: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'structure_score'
        },
        readingScore: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'reading_score'
        },
        overallScore: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'overall_score'
        },
        directorName: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: 'Riko Susiloputro',
            field: 'director_name'
        },
        certificateUrl: {
            type: DataTypes.STRING(500),
            allowNull: true,
            field: 'certificate_url'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    };

    const options = {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: 'certificates'
    };

    const Certificate = sequelize.define('Certificate', attributes, options);

    Certificate.associate = (models) => {
        // A Certificate belongs to a User
        Certificate.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });

        // A Certificate belongs to an Exam
        Certificate.belongsTo(models.Exam, {
            foreignKey: 'exam_id',
            as: 'exam'
        });
    };

    return Certificate;
};
