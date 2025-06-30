const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const AreaXPostVoteFeedback = sequelize.define('PostVoteFeedback', {
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false
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
    ],	  
    tableName: 'tbl_post_vote_feedbacks',
    collate: 'utf8mb4_general_ci',
    engine: 'InnoDB',	  
    timestamps: false
  });

  AreaXPostVoteFeedback.associate = (models) => { 
    AreaXPostVoteFeedback.belongsTo(models.User, { foreignKey: 'user_id' });
    AreaXPostVoteFeedback.belongsTo(models.AreaXWall, { foreignKey: 'post_id' });
  };

  return AreaXPostVoteFeedback;
};
