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
      unique: true,
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
      unique: true
    },
    // New payment-related fields
    group_type: {
      type: DataTypes.ENUM('open', 'exclusive'),
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
    created_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
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
            name: 'invite_link_index',
            fields: ['invite_link'],
            using: 'BTREE',
        }	    
    ],
    tableName: 'tbl_areax_group_chats',
    timestamps: false,
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
