const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const AreaXGroupPayments = sequelize.define('AreaXGroupPayments', {
    payment_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false
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
    payment_type: {
      type: DataTypes.ENUM('subscription', 'ticket', 'one_time'),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD',
      allowNull: false
    },
    stripe_payment_intent_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    stripe_subscription_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      defaultValue: 'pending',
      allowNull: false
    },
    payment_date: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
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
        name: 'stripe_payment_intent_id_index',
        fields: ['stripe_payment_intent_id'],
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
      }	    
    ],
    tableName: 'tbl_group_payments',
    timestamps: false,
    collate: 'utf8mb4_general_ci',
    engine: 'InnoDB',
  });

  AreaXGroupPayments.associate = (models) => {
    AreaXGroupPayments.belongsTo(models.AreaXGroupChats, { foreignKey: 'group_id', onDelete: 'CASCADE' });
    AreaXGroupPayments.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  };

  return AreaXGroupPayments;
};
