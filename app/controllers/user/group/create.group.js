const { db2 } = require("../../../models");

const ChatGroups = db2.groups;
const GroupMembers = db2.members;

module.exports.createGroup = async (groupData) => {
  try {
    const newGroup = await ChatGroups.create({
      admin_id: groupData.admin_id,
      admin_reference_number: groupData.admin_reference_number,	    
      group_name: groupData.group_name,
      description: groupData.description,
      background_image: groupData.background_image || null,
    });

    // Automatically add creator as a member with 'admin' role
    await GroupMembers.create({
      group_id: newGroup.group_id,
      user_id: groupData.admin_id,
      reference_number: groupData.admin_reference_number,	    
      role: 'admin'
    });

    return [true, newGroup];
  } catch (error) {
    console.error('Error creating group:', error.message);
    return [false, error.message];
  }
};
