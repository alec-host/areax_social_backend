const { db2 } = require("../../../models");

const ChatGroups = db2.groups;

module.exports.groupByReferenceNumber = async(group_id) => {
  try {
    const group = await ChatGroups.findOne({ where: { group_id, is_deleted: 0 }});

    return [true, group];
  } catch (error) {
    console.error('Error adding user to group:', error.message);
    return [false, error.message];
  }
};
