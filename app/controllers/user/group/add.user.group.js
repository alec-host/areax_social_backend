const { db2 } = require("../../../models");

const GroupMembers = db2.members;

module.exports.addUserToGroup = async(payload, role = 'member') => {
  try {
    const newMember = await GroupMembers.create({
      group_id: payload.group_id,
      user_id: payload.user_id,
      reference_number: payload.reference_number,	    
      role,
    });

    return [true, newMember];
  } catch (error) {
    console.error('Error adding user to group:', error.message);
    return [false, error.message];
  }
};
