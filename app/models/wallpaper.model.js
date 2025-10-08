// models/Wallpaper.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {

const AreaXWallpaper = sequelize.define('AreaXWallpaper', {
    media_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    reference_number: {
        type: DataTypes.STRING(100),
	allowNull: true   
    },	
    original_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    file_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    file_url: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    file_size: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    mime_type: {
        type: DataTypes.STRING(25),
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
    category: {
        type: DataTypes.STRING(45),
        defaultValue: 'custom'
    },	
    source: {
        type: DataTypes.STRING(45),
        allowNull: true       
    },	
    created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  }, {
    indexes: [
        {
            name: 'source_index',
            fields: ['source'],
            using: 'BTREE',
        },
        {
            name: 'file_type_index',
            fields: ['file_type'],
            using: 'BTREE',
        },
	{
            name: 'reference_number_index',
	    fields: ['reference_number'],
	    using: 'BTREE',	
	}
    ],
    tableName: 'tbl_areax_wallpapers',
    timestamps: false,
    collate: 'utf8mb4_general_ci',
    engine: 'InnoDB'
  });

return AreaXWallpaper;
};
