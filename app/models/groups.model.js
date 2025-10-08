const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, Sequelize) => {
  const AreaXGroupChats = sequelize.define('AreaXGroupChats', {
    group_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    group_reference_number: {
      type: DataTypes.STRING,
      defaultValue: () => `GRP_${uuidv4()}`,
      unique: 'group_reference_number_index_u',
      allowNull: false
    },	  
    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: false // Creator is the admin by default
    },
    admin_reference_number: {
      type: DataTypes.STRING(65),
      allowNull: false
    },	  
    group_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    background_image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    invite_link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // New payment-related fields
    group_type: {
      type: DataTypes.ENUM('open','private','exclusive'),
      defaultValue: 'open',
      allowNull: false
    },
    payment_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    payment_type: {
      type: DataTypes.ENUM('subscription', 'ticket', 'one_time'),
      allowNull: true
    },
    price_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    price_currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD',
      allowNull: true
    },
    stripe_product_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    stripe_price_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },	  
    subscription_interval: {
      type: DataTypes.ENUM('monthly', 'yearly', 'weekly'),
      allowNull: true
    },
    max_members: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    is_private: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },    	  
    is_secret_group: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },	
    live_stream_support: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    event_support: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    buy_sell_support: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },	  
    gift_token_support: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },	  
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },	  
    is_deleted: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  },{
    indexes: [
        {
            name: 'group_reference_number_index',
            fields: ['group_reference_number'],
            using: 'BTREE',
        },	    
        {
            name: 'admin_reference_number_index',
            fields: ['admin_reference_number'],
            using: 'BTREE',
        },
        {
            name: 'is_deleted_index',
            fields: ['is_deleted'],
            using: 'BTREE',
        },
        {
            name: 'group_type_index',
            fields: ['group_type'],
            using: 'BTREE',
        },
        {
            name: 'payment_required_index',
            fields: ['payment_required'],
            using: 'BTREE',
        },
	{
	    unique: true,	
	    fields: ['invite_link']	
	},
        {
            name: 'invite_link_index',
            fields: ['invite_link'],
            using: 'BTREE',
        }	    
    ],
    tableName: 'tbl_areax_groups',
    timestamps: true,
    createdAt: 'created_at', // maps Sequelize's createdAt to your field
    updatedAt: 'updated_at',  // maps Sequelize's updatedAt to your field	  
    collate: 'utf8mb4_general_ci',
    engine: 'InnoDB',	  
  });

  AreaXGroupChats.associate = (models) => {
     AreaXGroupChats.belongsTo(models.User, { foreignKey: 'admin_id', onDelete: 'CASCADE' });
     AreaXGroupChats.hasMany(models.AreaXGroupMembers, { foreignKey: 'group_id', onDelete: 'CASCADE' });
     AreaXGroupChats.hasMany(models.AreaXGroupMessages, { foreignKey: 'group_id', onDelete: 'CASCADE' });
  };

  return AreaXGroupChats;
};
