const { db2 } = require("../../../models");

const GroupInvites = db2.groups.invites;
const GroupMembers = db2.members;

module.exports.updateGroupUserMembership = async(reference_number,group_reference_number,updateFields) => {
  try {
    const [updatedCount] = await GroupMembers.update(updateFields, {
      where: {
        reference_number,
        group_reference_number,
      }
    });

    if(updatedCount === 0) {
      console.warn("No matching active group membership found to update.");
      return [false,'No matching active group membership found to update.'];	    
    }

    await GroupInvites.update({ is_registered: true, status: 'accepted', is_admin_accepted: 1 }, { where: { recipient_reference_number: reference_number, group_reference_number } });	  

    return [true,'User has accepted group invite.'];
  } catch (error) {
    console.error("Error: updating user group membership", error.message);
    return [false,'Error: updating user group membership'];
  }
};
