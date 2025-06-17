const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize)=> {
  const AreaXMaterializedMetric = sequelize.define('AreaXMaterializedMetric', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,	    
    },
    total_likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    total_comments: {
      type: DataTypes.INTEGER,
      defaultValue: 0	    
    },	  
  }, {
    indexes: [
	/*    
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
            name: 'is_updated_index',
            fields: ['is_updated']
        }
	*/
    ],
    tableName: 'tbl_areax_materialized_metric',
    timestamps: false,
    collate: 'utf8mb4_general_ci',
    engine: 'InnoDB',
  });

  return AreaXMaterializedMetric;
};
