// models/GroupSubscriptions.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const AreaXGroupSubscriptions = sequelize.define('AreaXGroupSubscriptions', {
    subscription_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    group_reference_number: {
      type: DataTypes.STRING(65),
      allowNull: true
    },	  
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_email: {
      type: DataTypes.STRING(65),
      allowNull: false
    },	  
    user_reference_number: {
      type: DataTypes.STRING(65),
      allowNull: false
    },
    stripe_subscription_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: 'stripe_subscription_id_index'
    },
    status: {
      type: DataTypes.ENUM('active', 'canceled', 'past_due', 'unpaid'),
      defaultValue: 'active',
      allowNull: false
    },
    current_period_start: {
      type: DataTypes.DATE,
      allowNull: false
    },
    current_period_end: {
      type: DataTypes.DATE,
      allowNull: false
    },
    cancel_at_period_end: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
    }
  }, {
    indexes: [
      {
        name: 'group_id_index',
        fields: ['group_id'],
        using: 'BTREE',
      },
      {
        name: 'user_id_index',
        fields: ['user_id'],
        using: 'BTREE',
      },
      {
        name: 'status_index',
        fields: ['status'],
        using: 'BTREE',
      },
      {
        name: 'stripe_subscription_id_index',
        fields: ['stripe_subscription_id'],
        using: 'BTREE',
      },
      {
        name: 'user_email_index',
        fields: ['user_email'],
        using: 'BTREE',
      },
      {
        name: 'user_reference_number_index',
        fields: ['user_reference_number'],
        using: 'BTREE',
      },
      {
        name: 'group_reference_number_index',
        fields: ['group_reference_number'],
        using: 'BTREE',
      }	    
    ],
    tableName: 'tbl_group_subscriptions',
    timestamps: false,
    collate: 'utf8mb4_general_ci',
    engine: 'InnoDB',
  });

  AreaXGroupSubscriptions.associate = (models) => {
    AreaXGroupSubscriptions.belongsTo(models.AreaXGroupChats, { foreignKey: 'group_id', onDelete: 'CASCADE' });
    AreaXGroupSubscriptions.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  };

  return AreaXGroupSubscriptions;
};
