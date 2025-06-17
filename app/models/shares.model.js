const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const AreaXShares = sequelize.define('AreaXShares', {
    share_id: {
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
    originator_reference_number: {
      type: DataTypes.STRING(65),
    },
    friend_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    recipient_reference_number: {
      type: DataTypes.STRING(65),
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  }, {
    indexes: [
        {
            name: 'originator_reference_number',
            fields: ['originator_reference_number'],
            using: 'BTREE',
        },
        {
            name: 'recipient_reference_number',
            fields: ['recipient_reference_number'],
            using: 'BTREE',
        },	    
    ],	  
    tableName: 'tbl_areax_shares',
    timestamps: false,
    collate: 'utf8mb4_general_ci',
    engine: 'InnoDB'	  
  });

  AreaXShares.associate = (models) => {
    AreaXShares.belongsTo(models.AreaXSocialWall, { foreignKey: 'post_id', onDelete: 'CASCADE' });
    AreaXShares.belongsTo(models.Users, { foreignKey: 'user_id', onDelete: 'CASCADE' });
    AreaXShares.belongsTo(models.Users, { foreignKey: 'friend_id', onDelete: 'CASCADE' });
  };

  return AreaXShares;
};
