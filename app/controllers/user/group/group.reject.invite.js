const { db2 } = require("../../../models");

const GroupMembers = db2.members;
const GroupInvites = db2.groups.invites;

module.exports.deleteGroupUserInviteMembership = async (reference_number, group_reference_number) => {
  try{
   
    // Delete invite record
    const deletedInviteCount = await GroupInvites.destroy({
      where: {
	is_registered: 0,
	status: 'pending',      
        recipient_reference_number: reference_number,
        group_reference_number
      }
    });

    if(deletedInviteCount === 0){
       return [false, 'No Group Invite record found.'];
    }

    // Delete membership record	  
    const deletedMembershipCount = await GroupMembers.destroy({
      where: {
        is_active: 0,
        reference_number,
        group_reference_number
      }
    }); 

    return [true,{
      membershipDeleted: deletedMembershipCount,
      inviteDeleted: deletedInviteCount
    }];
  }catch(error){
    console.error("Error: deleting user group invite & membership", error.message);
    return [false,{
      membershipDeleted: 0,
      inviteDeleted: 0,
      error: error.message
    }];
  }
};
