// models/ReportedGroupMember.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const AreaXReportedGroupMember = sequelize.define('AreaXReportedGroupMember', {
    report_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    group_reference_number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    reported_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reported_reference_number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    reported_username: {
      type: DataTypes.STRING(100),
      allowNull: true
    },	  
    reported_profile_picture_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },	  
    reporter_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reporter_reference_number: {
      type: DataTypes.STRING,
      allowNull: false
    },	  
    reason: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    additional_context: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'reviewed', 'dismissed', 'actioned'),
      defaultValue: 'pending'
    },
    reviewed_by: {
      type: DataTypes.STRING,
      allowNull: true
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'tbl_reported_group_members',
    timestamps: false,
    indexes: [
      {
        name: 'idx_group_id',
        fields: ['group_id']
      },
      {
        name: 'idx_reported_user_id',
        fields: ['reported_user_id']
      },
      {
        name: 'idx_reporter_user_id',
        fields: ['reporter_user_id']
      },
      {
        name: 'idx_status',
        fields: ['status']
      },
      {
        name: 'idx_group_reference_number',
        fields: ['group_reference_number']
      },
      {
        name: 'idx_reported_reference_number',
        fields: ['reported_reference_number']
      },
      {
        name: 'idx_reporter_reference_number',
        fields: ['reporter_reference_number']
      }
    ]
  });

  return AreaXReportedGroupMember;
};
