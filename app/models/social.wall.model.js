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
    username: {
      type: DataTypes.STRING(65),
    },
    group_reference_number: {
      type: DataTypes.STRING(65),
      allowNull: true	    
    },	  
    profile_image_url: {
       type: DataTypes.TEXT,
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
    location_name: {
      type: DataTypes.STRING(65),
      allowNull: true
    },	  
    post_type: {
      type: DataTypes.ENUM('social-board','show-board','cross-board','group-board','social-ai-board'),
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
    type: {
      type: DataTypes.ENUM('image','video','other'),
      defaultValue: 'other',	    
      allowNull: false
    },	  
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    is_liked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false      
    },
    is_saved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false	    
    },
    is_flagged: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false	    
    },	  
    is_buy_enabled: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    is_comment_allowed: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },	 
    is_minted_automatically: {
      type: DataTypes.INTEGER,
      defaultValue: 1	    
    },	  
    is_public: {
      type: DataTypes.ENUM('everyone','private','inner-circle'),
      defaultValue: 'everyone'
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
            name: 'group_reference_number_index',
            fields: ['group_reference_number'],
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
            name: 'is_liked_index',
            fields: ['is_liked'],
            using: 'BTREE',
        },
        {
            name: 'is_saved_index',
            fields: ['is_saved'],
            using: 'BTREE',
        },
        {
            name: 'is_flagged_index',
            fields: ['is_flagged'],
            using: 'BTREE',
        },
	{
            name: 'is_public_index',
            fields: ['is_public'],
            using: 'BTREE',
	}, 	    
	{
            name: 'flag_index',
	    fields: ['is_deleted','is_buy_enabled','is_comment_allowed','is_minted_automatically']	
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
