const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const AreaXComments = sequelize.define('AreaXComments', {
    comment_id: {
      	type: DataTypes.INTEGER,
      	autoIncrement: true,
      	primaryKey: true,
    },
    parent_comment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
           model: 'tbl_areax_comments',
           key: 'comment_id'
        },
       onDelete: 'CASCADE'
    },	  
    post_id: {
      	type: DataTypes.INTEGER,
      	allowNull: false,
    },	  
    user_id: {
      	type: DataTypes.INTEGER,
      	allowNull: false,
    }, 
    commentor_email: {
      	type: DataTypes.STRING(65),
      	allowNull: true
    },	  
    commentor_reference_number: {
      	type: DataTypes.STRING(65),
    },
    commentor_profile_url_image: {
        type: DataTypes.STRING(2048),
        allowNull: true
    },	  
    commentor_username: {
        type: DataTypes.STRING(65),
        allowNull: true
    },	  
    comment_text: {
      	type: DataTypes.STRING(240),
      	allowNull: false,
    },
    created_at: {
      	type: DataTypes.DATE,
    	defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    is_edited:{
        type: DataTypes.INTEGER,
    	defaultValue: 0
    },	  
    is_deleted: {
        type: DataTypes.INTEGER,
        defaultValue: 0 
    },	  
  }, {
    indexes: [
        {
            name: 'commentor_reference_number_index',
            fields: ['commentor_reference_number'],
            using: 'BTREE',
        },
	{
            name: 'commentor_email_index',
            fields: ['commentor_email'],
            using: 'BTREE',
	},
	{
            name: 'flag_index',
	    fields: ['is_edited','is_deleted'],	
	}
    ],	  
    tableName: 'tbl_areax_comments',
    timestamps: false,
    collate: 'utf8mb4_general_ci',
    engine: 'InnoDB',	  
  });

  AreaXComments.associate = (models) => {
    AreaXComments.belongsTo(models.AreaXSocialWall, { foreignKey: 'post_id', onDelete: 'CASCADE' });
    AreaXComments.belongsTo(models.Users, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  };

  return AreaXComments;
};
