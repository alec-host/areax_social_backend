const { db2 } = require("../../../models");

const GroupMembers = db2.members;

module.exports.removeUserFromGroup = async(group_id,reference_number) => {
  try {

    const count = await GroupMembers.count({
      where: { group_id, reference_number }
    });

    if (count === 0) {
      return [false, 'No group membership found to remove'];
    }
	  
    await GroupMembers.destroy({
      where: { group_id, reference_number },
    });

    return [true, 'User removed from group'];
  } catch (error) {
    console.error('Error removing user from group:', error.message);
    return [false, error.message];
  }
};
