// models/GroupInvites.js
const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, Sequelize) => {
  const GroupInvites = sequelize.define('GroupInvites', {
    invite_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    group_reference_number: {
      type: DataTypes.STRING(75),
      allowNull: false
    },
    group_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    group_photo_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },	  
    max_members: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    group_type: {
      type: DataTypes.STRING(40),
      allowNull: true
    },	
    is_secret_group: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },	  
    token: {
      type: DataTypes.STRING(255),
      defaultValue: () => uuidv4(),
      unique: 'token',
      allowNull: false
    },
    invite_link: {
      type: DataTypes.TEXT,
      allowNull: true
    },	  
    recipient_reference_number: {
      type: DataTypes.STRING(75), // email, phone, or reference_number
      allowNull: false
    },
    recipient_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },	  
    recipient_photo_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },	  
    is_registered: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'expired'),
      defaultValue: 'pending'
    },
    is_admin_accepted: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    admin_invite: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },	  
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    indexes: [
        {
            name: 'group_reference_number_index',
            fields: ['group_reference_number'],
            using: 'BTREE',
        },
        {
            name: 'token_index',
            fields: ['token'],
            using: 'BTREE',
        },
        {
            name: 'group_type_index',
            fields: ['group_type'],
            using: 'BTREE',
        },
        {
            name: 'recipient_reference_number_index',
            fields: ['recipient_reference_number'],
            using: 'BTREE',
        },
        {
            name: 'status_index',
            fields: ['status'],
            using: 'BTREE',
        },
	{
            name: 'is_secret_group_index',
            fields: ['is_secret_group'],
            using: 'BTREE', 		
	},
        {
            name: 'is_admin_accepted_index',
            fields: ['is_admin_accepted'],
            using: 'BTREE',
        },
        {
            name: 'admin_invite_index',
            fields: ['admin_invite'],
            using: 'BTREE',
        }	    
    ],	  
    tableName: 'tbl_areax_group_invites',
    timestamps: false
  });

  return GroupInvites;
};
