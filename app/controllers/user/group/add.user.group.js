const { db2 } = require("../../../models");

const GroupMembers = db2.members;

module.exports.addUserToGroup = async(payload, role = 'member') => {
  try {
    const existing = await GroupMembers.findOne({
      where: {
	group_id: payload.group_id,
        user_id: payload.user_id,
        is_deleted: 0
      }
    });	  
    if(existing){
       return [false, 'User is already a member of the group'];
    }	  
    const newMember = await GroupMembers.create({
      group_id: payload.group_id,
      group_reference_number: payload.group_reference_number,	    
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
