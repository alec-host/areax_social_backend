const { db2 } = require("../../../models");

const GroupMembers = db2.members;
const GroupInvites = db2.groups.invites;

module.exports.findGroupUserMemberShipCount = async(reference_number,group_reference_number) => {
  try {
    const [isMemberCount,isMutedCount,pendingRequestCount] = await Promise.all([
       GroupMembers.count({ where: { reference_number,group_reference_number, is_active: 1, is_deleted: 0 } }),
       GroupMembers.count({ where: { reference_number,group_reference_number, is_muted: 1, is_active: 1, is_deleted: 0 } }),	    
       GroupInvites.count({ where: { status: 'pending', group_reference_number: group_reference_number } })	    
    ]);  
    //const groupCount = await GroupMembers.count({ where: { reference_number,group_reference_number,is_active: 1 } });
    return [true, { is_member: isMemberCount, is_muted: isMutedCount, has_pending_request: pendingRequestCount }];
    //return groupCount;
  } catch (error) {
    console.error("Error: getting user group membership", error.message);
    return [false, `Error retrieving user membership activity`];
  }
};

/*
 *
 *
 *
 *
 * const GroupInvites = db2.groups.invites;

module.exports.groupInviteLinkExist = async(invite_code) => {
  try {
    const groupInvite = await GroupInvites.findOne({ where: { token:invite_code, status: 'pending' }});

     // Compute fresh metrics
     const [memberCount, postCount, commentCount] = await Promise.all([
        GroupMembers.count({
           where: { group_reference_number: groupReferenceNumber, is_deleted: 0 }
        }),
        Wall.count({
           where: { group_reference_number: groupReferenceNumber, is_deleted: 0 }
        }),
        Comments.count({
           where: { group_reference_number: groupReferenceNumber, is_deleted: 0 }
        })
     ]);

 *
 * */
