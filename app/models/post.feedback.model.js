const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const AreaXPostFeedback = sequelize.define('AreaXPostFeedback', {
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    creator_email: {
      type: DataTypes.STRING(65),
      allowNull: true	    
    },
    creator_reference_number:{
      type: DataTypes.STRING(65),	   
      allowNull: true	    
    },	  
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(65),
    },	  
    reference_number: {
      type: DataTypes.STRING(65),
    },
    media_url: {
      type: DataTypes.TEXT,
      allowNull: true,// unnormalization: added to avoid table join with social wall table.	    
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,// unnormalization: added to avoid table join with social wall table.
    },	  
    vote_type: {
      type: DataTypes.ENUM('upvote', 'downvote'),
      allowNull: false
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true // Only used for downvotes with user-provided feedback
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    is_processed: {
      type: DataTypes.INTEGER,
      defaultValue: 0	    
    }
  }, {
     indexes: [
	{
            name: 'email_vote_index',
            fields: ['email'],
            using: 'BTREE',
	},     
        {
            name: 'reference_number_vote_index',
            fields: ['reference_number'],
            using: 'BTREE',
        },
        {
            name: 'is_processed_index',
            fields: ['is_processed'],
            using: 'BTREE',
        },	     
    ],	  
    tableName: 'tbl_areax_post_feedback',
    collate: 'utf8mb4_general_ci',
    engine: 'InnoDB',	  
    timestamps: false
  });

  AreaXPostFeedback.associate = (models) => { 
    AreaXPostFeedback.belongsTo(models.User, { foreignKey: 'user_id' });
    AreaXPostFeedback.belongsTo(models.AreaXWall, { foreignKey: 'post_id' });
  };

  return AreaXPostFeedback;
};
