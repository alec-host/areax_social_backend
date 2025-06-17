const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const AreaXGroupMessages = sequelize.define('AreaXGroupMessages', {
    message_id: {
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
    reference_number: {
      type: DataTypes.STRING(65),
      allowNull: false    
    },	  
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    media_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    edited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_deleted: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    sent_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    alignment_flag: {
      type: DataTypes.ENUM('left', 'right'),
      allowNull: false
    }
  },{
    indexes: [
        {
            name: 'reference_number_index',
            fields: ['reference_number'],
            using: 'BTREE',
        },
        {
            name: 'is_deleted_index',
            fields: ['is_deleted'],
            using: 'BTREE',
        },
    ],
    tableName: 'tbl_areax_group_messages',
    timestamps: false,
    collate: 'utf8mb4_general_ci',
    engine: 'InnoDB',
  });

  AreaXGroupMessages.associate = (models) => {
     AreaXGroupMessages.belongsTo(models.AreaXGroupChats, { foreignKey: 'group_id', onDelete: 'CASCADE' });
     AreaXGroupMessages.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  };

  return AreaXGroupMessages;
};
