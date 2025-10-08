const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const AreaXBids = sequelize.define('AreaXBids', {
    bid_id: {
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
      type: DataTypes.STRING(105),
      allowNull: true	    
    },
    bidder_email: {
      type: DataTypes.STRING(105),
      allowNull: false
    },	  
    bidder_reference_number: {
      type: DataTypes.STRING(105),
      allowNull: false	    
    },
    bid_amount: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
    },
    bid_type: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        isIn: [['open', 'closed']],
      },	    
    },	  
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    visibility: {
      type: DataTypes.BOOLEAN, // True for visible to all (open), false for organizer-only (closed)
      defaultValue: true,
    },	
    close_time: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
        notNull(value) {
          if (!value) throw new Error('Close time must be defined for closed bids.');
        },
      },
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
            fields: ['bidder_email'],
            using: 'BTREE',
	},
	{
            name: 'bidder_reference_number_index',
	    fields: ['bidder_reference_number'],
	    using: 'BTREE',	
	},
	{
            name: 'other_index',
            fields: ['visibility','bid_type']		
	}
    ],	  
    tableName: 'tbl_areax_bids',
    timestamps: false,
    collate: 'utf8mb4_general_ci',
    engine: 'InnoDB',	  
  });

  AreaXBids.associate = (models) => {
    AreaXBids.belongsTo(models.AreaXSocialWall, { foreignKey: 'post_id', onDelete: 'CASCADE' });
    AreaXBids.belongsTo(models.Users, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  };

  return AreaXBids;
};
