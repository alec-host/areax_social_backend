const { DataTypes } = require('sequelize');

module.exports = (sequelize,Sequelize) => {
  const AreaXRequestFriends = sequelize.define('AreaXRequestFriends', {
    _id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    reference_number: {
      type: DataTypes.STRING(105),
    },
    originator_reference_number: {
      type: DataTypes.STRING(105),
    },
    originator_name: {
      type: DataTypes.STRING(105),
      allowNull: true
    },
    originator_caption: {
      type: DataTypes.TEXT,	    
      allowNull: true
    },
    originator_profile_picture_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
         isUrl: {
             msg: "Invalid URL format."
         },
      }
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: () => new Date().toISOString(),
    },
  }, {
    indexes: [
        {
            name: 'reference_number_index',
            fields: ['reference_number'],
            using: 'BTREE',
        },
        {
            name: 'originator_reference_number_index',
            fields: ['originator_reference_number'],
            using: 'BTREE',
        },
    ],
    tableName: 'tbl_areax_request_friends',
    timestamps: false,
    collate: 'utf8mb4_general_ci',
    engine: 'InnoDB',
  });

  return AreaXRequestFriends;
};
