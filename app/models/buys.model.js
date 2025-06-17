const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const AreaXPurchases = sequelize.define('AreaXPurchases', {
    purchase_id: {
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
    reference_number: {
      type: DataTypes.STRING(65),
      allowNull: true	    
    },
    buyer_email: {
      type: DataTypes.STRING(65),
      allowNull: true
    },
    buyer_reference_number: {
      type: DataTypes.STRING(65),
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    is_archived: {
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
            fields: ['buyer_email'],
            using: 'BTREE',
        },
	{
            name: 'buyer_reference_number_index',
	    fields: ['buyer_reference_number'],
	    using: 'BTREE',	
	},
        {
            name: 'flag_index',
            fields: ['is_archived']
        }
    ],
    tableName: 'tbl_areax_purchases',
    timestamps: false,
    collate: 'utf8mb4_general_ci',
    engine: 'InnoDB',
  });

  AreaXPurchases.associate = (models) => {
    AreaXPurchases.belongsTo(models.AreaXSocialWall, { foreignKey: 'post_id', onDelete: 'CASCADE' });
    AreaXPurchases.belongsTo(models.Users, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  };

  return AreaXPurchases;
};
	
