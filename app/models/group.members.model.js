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
    name: {
      type: DataTypes.STRING(75),
      allowNull: true
    },	  
    group_reference_number: {
      type: DataTypes.STRING(75),
      allowNull: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reference_number: {
      type: DataTypes.STRING(65),
      allowNull: false
    },
    profile_picture_url: {
      type: DataTypes.STRING(2048),
      allowNull: true,
      validate: {
        isUrl: {
           msg: "Invalid URL format."
        },
      }
    },	  
    role: {
      type: DataTypes.ENUM('admin', 'member'),
      defaultValue: 'member'
    },
    joined_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    is_muted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },	 
    muted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null	    
    },
    muted_by: {
      type: DataTypes.STRING(75),
      allowNull: true
    },	  
    mute_reason: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_active: {
      type: DataTypes.INTEGER,
      defaultValue: 0      
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
            name: 'group_reference_number_index',
            fields: ['group_reference_number'],
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
        {
            name: 'is_muted_index',
            fields: ['is_muted'],
            using: 'BTREE',
        },	    
        {
            name: 'group_id_index',
            fields: ['group_id'],
            using: 'BTREE',
        },
	{
            name: 'is_active_index',
            fields: ['group_id'],
            using: 'BTREE',
	},    
	{    
            unique: true,
            fields: ['group_id', 'user_id'],
            name: 'uniq_group_user'	    
	}
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
