const { db2 } = require("../../../models");

const GroupMembers = db2.members;

module.exports.getGroupMemberCount = async(group_id) => {
  try {
    const groupCount = await GroupMembers.count({ where: { group_id } });

    return [true, groupCount];
  } catch (error) {
    console.error('Error adding user to group:', error.message);
    return [false, error.message];
  }
};
