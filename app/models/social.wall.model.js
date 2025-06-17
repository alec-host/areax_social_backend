const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const AreaXWall = sequelize.define('AreaXWall', {
    post_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(65),
         allowNull: true
    },	  
    reference_number: {
      type: DataTypes.STRING(65),
    },
    media_url: {
      type: DataTypes.TEXT,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    item_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    gps_coordinates: {
      type: DataTypes.STRING(15),
      allowNull: true  	    
    },	  
    post_type: {
      type: DataTypes.ENUM('social-board','show-board','cross-list','chat-group','social-ai-board'),
      allowNull: false,
    },	 
    bid_type: {
      type: DataTypes.ENUM('open','closed'),
      allowNull: true,
    },
    bid_close_time: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
      },
    },
    category: {
      type: DataTypes.STRING(35),
      allowNull: true
    },	  
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    is_public: {
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
            name: 'post_type_index',
	    fields: ['post_type'],
            using: 'BTREE',		
	},
	{
            name: 'category_index',
            fields: ['category'],
            using: 'BTREE',
	},
	{
            name: 'flag_index',
	    fields: ['is_public','is_deleted']	
	}
    ],
    tableName: 'tbl_areax_wall',
    timestamps: false,
    collate: 'utf8mb4_general_ci',
    engine: 'InnoDB',
    timestamps: false,
  });

  AreaXWall.associate = (models) => {
    AreaXWall.belongsTo(models.Users, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  };

  return AreaXWall;
};
