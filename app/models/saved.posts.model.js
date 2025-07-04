const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize)=> {
  const AreaXSavedPosts = sequelize.define('AreaXSavedPosts', {
    saved_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    is_updated: {
         type: DataTypes.INTEGER,
         defaultValue: 0
    },
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
        {
            name: 'is_updated_index',
            fields: ['is_updated']
        }
    ],
    tableName: 'tbl_areax_saved_posts',
    timestamps: false,
    collate: 'utf8mb4_general_ci',
    engine: 'InnoDB',
  });

  AreaXSavedPosts.associate = (models) => {
    AreaXSavedPosts.belongsTo(models.Users, { foreignKey: 'user_id', onDelete: 'CASCADE' });
    AreaXSavedPosts.belongsTo(models.AreaXSocialWall, { foreignKey: 'post_id', onDelete: 'CASCADE' });
  };

  return AreaXSavedPosts;
};

