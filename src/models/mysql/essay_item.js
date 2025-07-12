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
        essayId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        number: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        topic: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        systemPrompt: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    };

    const options = {
        timestamps: true,
        paranoid: true,
        underscored: true,
        tableName: 'essay_items'
    };

    const EssayItem = sequelize.define('EssayItem', attributes, options);

    EssayItem.associate = (models) => {
        EssayItem.belongsTo(models.Essay, {
            targetKey: 'id',
            foreignKey: 'essay_id'
        });
    };

    return EssayItem;
};
