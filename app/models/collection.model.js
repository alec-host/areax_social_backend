const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const AreaXCollection = sequelize.define('AreaXCollection', {
    collection_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },	
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    /*	  
    post_id: {
      type: DataTypes.STRING(15),
      allowNull: false      
    },
    */
    collection_reference_number: {
      type: DataTypes.STRING(165),
      allowNull: true
    },
    creator_reference_number: {
      type: DataTypes.STRING(165),
      allowNull: true
    },
    creator_name: {
      type: DataTypes.STRING(165),
      allowNull: true
    },	  
    profile_picture_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },	  
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    is_saved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    is_shared: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
  }, {
    indexes: [
        {
            name: 'collection_reference_number_index',
            fields: ['collection_reference_number'],
            using: 'BTREE',
        },
        {
            name: 'collection_flag_index',
            fields: ['is_saved','is_shared']
        }
    ],
    tableName: 'tbl_areax_collection',
    timestamps: false,
    collate: 'utf8mb4_general_ci',
    engine: 'InnoDB',
    timestamps: false,
  });

  AreaXCollection.associate = (models) => {
     AreaXCollection.belongsTo(models.AreaXWall, { foreignKey: 'collection_reference_number', onDelete: 'CASCADE' });
  };

  return AreaXCollection;
};
