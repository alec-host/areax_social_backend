const { db2 } = require("../../../models");

const GroupMembers = db2.members;

module.exports.findGroupUserMemberShipCount = async(reference_number,group_reference_number) => {
  try {
    const groupCount = await GroupMembers.count({ where: { reference_number,group_reference_number } });
    return groupCount;
  } catch (error) {
    console.error("Error: getting user group membership", error.message);
    return 0;
  }
};
