const { DataTypes } = require('sequelize');

// Define the User model
module.exports = (sequelize, Sequelize) => {
   const User = sequelize.define('User', {
      _id: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true
      },
      reference_number: {
         type: DataTypes.STRING(65),
         unique: true,
         allowNull: false
      },
      google_user_id: {
         type: DataTypes.STRING(255),
         allowNull: false
      },
      email: {
         type: DataTypes.STRING(65),
         allowNull: false
      },
      phone: {
         type: DataTypes.STRING(20),
         allowNull: true
      },
      username: {
          type: DataTypes.STRING(255),
          allowNull: true
      },
      display_name: {
          type: DataTypes.STRING(255),
          allowNull: true
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
      caption: {
         type: DataTypes.STRING(160),
         allowNull: true
      },
      guardian_picture_url: {
         type: DataTypes.STRING(2048),
         allowNull: true,
         validate: {
             isUrl: {
                msg: "Invalid URL format."
             },
         }
      },
      tier_reference_number: {
         type: DataTypes.STRING(65),
         allowNull: true
      },
      country: {
         type: DataTypes.STRING(65),
         allowNull: true
      },
      city: {
         type: DataTypes.STRING(65),
         allowNull: true
      },
      access_token: DataTypes.STRING(300),
      refresh_token: DataTypes.STRING(300),
      token_expiry: DataTypes.DATE,
      password: DataTypes.STRING(65),
      token_id: DataTypes.STRING(70),
      hashed_token_id: DataTypes.STRING(70),
      privacy_status: {
        type: DataTypes.ENUM("public", "friends_only", "anonymous"),
        defaultValue: "public",
        allowNull: false
      },
      created_at: {
         type: DataTypes.DATE,
         defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
         type: DataTypes.DATE,
         defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
         onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      email_verified: {
         type: DataTypes.INTEGER,
         defaultValue: 0
      },
      phone_verified: {
         type: DataTypes.INTEGER,
         defaultValue: 0
      },
      is_online: {
         type: DataTypes.INTEGER,
         defaultValue: 0
      },
      is_deleted: {
         type: DataTypes.INTEGER,
         defaultValue: 0
      }
      },{
         indexes: [{
            name: 'idx_areax_users',
            unique: false,
            fields : ['reference_number','phone','email','privacy_status','email_verified','phone_verified','is_online','is_deleted']
        }],
         // Define table options
         timestamps: false,
         tableName: 'tbl_areax_users'
      });

      return User;
};
      //User.associate = (models) => {
	 //console.log('WWWWWWWWWWWWW ',models);     
         //User.hasMany(models.AreaXFriends, { foreignKey: 'user_id', onDelete: 'CASCADE' });
         //User.hasMany(models.AreaXFriends, { foreignKey: 'friend_id', onDelete: 'CASCADE' });
         //User.hasMany(models.AreaXGroupChats, { foreignKey: 'admin_id', onDelete: 'CASCADE' });
         //User.hasMany(models.AreaXGroupMembers, { foreignKey: 'user_id', onDelete: 'CASCADE' });
         //User.hasMany(models.AreaXGroupMessages, { foreignKey: 'user_id', onDelete: 'CASCADE' });
      //};	
