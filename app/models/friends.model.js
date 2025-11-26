const { DataTypes } = require('sequelize');

module.exports = (sequelize,Sequelize) => {
  const AreaXFriends = sequelize.define('AreaXFriends', {
    _id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(105),
      allowNull: false,
    },	  
    reference_number: {
      type: DataTypes.STRING(165),
    },
    friend_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    friend_reference_number: {
      type: DataTypes.STRING(165),
    },
    friend_name: {
      type: DataTypes.STRING(105),
      allowNull: true	    
    },	
    friend_caption: {
      type: DataTypes.TEXT('medium'),
      allowNull: true
    },
    friend_profile_picture_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
         isUrl: {
             msg: "Invalid URL format."
         },
      }
    },	  
    friend_category: {
      type: DataTypes.ENUM('following','follow'),
      allowNull: true	    
    },
    close_friend_tag: {
      type: DataTypes.STRING(25),
      allowNull: true      
    },  	  
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'blocked', 'unfriended'),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: () => new Date().toISOString(),
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
            fields: ['email'],
            using: 'BTREE',		
	},
        {
            name: 'status_index',
            fields: ['status'],
            using: 'BTREE',
        },
	{
            name: 'friend_reference_number_index',
	    fields: ['friend_reference_number'],
	    using: 'BTREE',	
	},
	{
            name: 'friend_category_index',
            fields: ['friend_category'],
            using: 'BTREE',
	}, 
        {
            name: 'close_friend_tag_index',
            fields: ['close_friend_tag'],
            using: 'BTREE',
        },	    
        {
            unique: true,
            fields: ['user_id', 'reference_number', 'friend_id', 'friend_reference_number'],
            name: 'user_ref_friend_unique'
        },  
    ],	  
    tableName: 'tbl_areax_friends',
    timestamps: false,
    collate: 'utf8mb4_general_ci',
    engine: 'InnoDB',
  });

  AreaXFriends.associate = (models) => {
    AreaXFriends.belongsTo(models.Users, { foreignKey: 'user_id', onDelete: 'CASCADE' });
    AreaXFriends.belongsTo(models.Users, { foreignKey: 'friend_id', onDelete: 'CASCADE' });
  };

  return AreaXFriends;
};
