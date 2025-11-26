const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const AreaXInviteCollection = sequelize.define('AreaXInviteCollection', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },	  
    reference_number: {
      type: DataTypes.STRING(165),
      allowNull: false
    },
    profile_picture_url: {
      type: DataTypes.TEXT,
      allowNull: false
    },	
    collection_name: {
      type: DataTypes.STRING(75),
      alllowNull: true
    },	  
    collection_reference_number: {
      type: DataTypes.STRING(165),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending','accepted','rejected'),
      defaultValue: 'pending',
    },	  
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    is_deleted: {
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
            name: 'reference_number_index',
            fields: ['reference_number'],
            using: 'BTREE',
        },
        {
            name: 'status_index',
            fields: ['status'],
            using: 'BTREE',
        },	    
        {
            name: 'collection_invite_flag_index',
            fields: ['is_deleted']
        }
    ],
    tableName: 'tbl_areax_collection_invite',
    timestamps: false,
    collate: 'utf8mb4_general_ci',
    engine: 'InnoDB',
    timestamps: false,
  });

  AreaXInviteCollection.associate = (models) => {
     AreaXInviteCollection.belongsTo(models.AreaXCollection, { foreignKey: 'collection_reference_number', onDelete: 'CASCADE' });
  };

  return AreaXInviteCollection;
};
