module.exports = (sequelize, DataTypes) => {
  const attributes = {
    id: {
      type: DataTypes.INTEGER().UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    uuid: {
      type: DataTypes.STRING(36),
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.INTEGER().UNSIGNED,
      allowNull: false,
    },
    rating: {
      type: DataTypes.TINYINT(3).UNSIGNED,
      allowNull: true,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  };

  const options = {
    timestamps: true,
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    tableName: "user_reviews",
  };

  const UserReviews = sequelize.define("UserReviews", attributes, options);

  UserReviews.associate = (models) => {
    UserReviews.belongsTo(models.User, {
      targetKey: "id",
      foreignKey: "user_id",
    });
  };

  return UserReviews;
};
