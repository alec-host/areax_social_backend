const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const CommentLike = sequelize.define('CommentLike', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    comment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'tbl_areax_comments', key: 'comment_id' },
      onDelete: 'CASCADE',
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(65),
         allowNull: true
    },
    reference_number: {
      type: DataTypes.STRING(65),
    },	  
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  }, {
     indexes: [
        {
            name: 'reference_number_index',
            fields: ['reference_number'],
            using: 'BTREE',
        },
        {
            name: 'email_index',
            fields: ['email'],
            using: 'BTREE',
        },
    ],	  
    tableName: 'tbl_comment_likes',
    timestamps: false,
    collate: 'utf8mb4_general_ci',
    engine: 'InnoDB',	  
  });

  CommentLike.associate = (models) => {
    CommentLike.belongsTo(models.Users, { foreignKey: 'user_id' });
    CommentLike.belongsTo(models.AreaXComments, { foreignKey: 'comment_id' });
  };

  return CommentLike;
};
