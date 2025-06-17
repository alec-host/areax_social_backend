const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const AreaXGroupChats = sequelize.define('AreaXGroupChats', {
    group_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
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
            name: 'admin_reference_number_index',
            fields: ['admin_reference_number'],
            using: 'BTREE',
        },
        {
            name: 'is_deleted_index',
            fields: ['is_deleted'],
            using: 'BTREE',
        },
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
