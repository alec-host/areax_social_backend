const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const AreaXGroupMembers = sequelize.define('AreaXGroupMembers', {
    membership_id: {
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
    role: {
      type: DataTypes.ENUM('admin', 'member'),
      defaultValue: 'member'
    },
    joined_at: {
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
            name: 'reference_number_index',
            fields: ['reference_number'],
            using: 'BTREE',
        },
        {
            name: 'role_index',
            fields: ['role'],
            using: 'BTREE',
        },
        {
            name: 'is_deleted_index',
            fields: ['is_deleted'],
            using: 'BTREE',
        },
    ],
    tableName: 'tbl_areax_group_members',
    timestamps: false,
    collate: 'utf8mb4_general_ci',
    engine: 'InnoDB',
  });

  AreaXGroupMembers.associate = (models) => {
     AreaXGroupMembers.belongsTo(models.AreaXChatGroups, { foreignKey: 'group_id', onDelete: 'CASCADE' });
     AreaXGroupMembers.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  };	

  return AreaXGroupMembers;
};
