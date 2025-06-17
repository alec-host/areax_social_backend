const { db2 } = require("../../../models");

const GroupMembers = db2.members;

module.exports.removeUserFromGroup = async(group_id, user_id) => {
  try {
    await GroupMembers.destroy({
      where: { group_id, user_id },
    });

    return [true, 'User removed from group'];
  } catch (error) {
    console.error('Error removing user from group:', error.message);
    return [false, error.message];
  }
};
