// models/File.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {

const AreaXFile = sequelize.define('AreaXFile', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(65),
         allowNull: true
    },
    reference_number: {
      type: DataTypes.STRING(65),
    },	
    original_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    file_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    file_url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    file_size: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    mime_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    file_type: {
        type: DataTypes.ENUM('image', 'video'),
        allowNull: false
    },
    s3_key: {
        type: DataTypes.STRING,
        allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },	
  }, {
    indexes: [
        {
            name: 'email',
            fields: ['email'],
            using: 'BTREE',
        },
        {
            name: 'reference_number',
            fields: ['reference_number'],
            using: 'BTREE',
        },
        {
            name: 'file_type',
            fields: ['file_type'],
            using: 'BTREE',
        },	    
    ],	  
    tableName: 'tbl_areax_files',
    timestamps: false,
    collate: 'utf8mb4_general_ci',
    engine: 'InnoDB'	  
  });

return AreaXFile; 
};
