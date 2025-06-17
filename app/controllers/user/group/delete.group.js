const { db2 } = require("../../../models");

const ChatGroups = db2.groups;
const GroupMembers = db2.members;

module.exports.deleteGroup = async (group_id) => {
  try {
    await GroupMembers.destroy({ where: { group_id } }); // Remove members first
    await ChatGroups.destroy({ where: { group_id } }); // Delete the group

    return [true, 'Group deleted successfully'];
  } catch (error) {
    console.error('Error deleting group:', error.message);
    return [false, error.message];
  }
};
