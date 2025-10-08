const { Op } = require('sequelize');
const { db,db2 } = require("../../../models");

const Users = db.users;
const Friends = db2.friends;
const GroupMembers = db2.members;
/*
module.exports.addUserToGroup = async(data, role = 'member') => {
  try {

    if(!Array.isArray(data.member_reference_numbers) || data.member_reference_numbers.length === 0) return [false, 'Member reference number must be provided'];	 
    const acceptedFriends = await Friends.findAll({
       where: {
          user_id: data.user_id,
          friend_reference_number: data.member_reference_numbers,
          status: 'accepted',
       },
       attributes: ['friend_id', 'friend_reference_number'],
    });	  
    
    if(acceptedFriends.length === 0) return [false, 'Only confirmed friend[s] can be added to the group'];

    const existingMembers = await GroupMembers.findAll({
       where: {
          group_id: data.group_id,
          user_id: acceptedFriends.map(f => f.friend_id),
          is_deleted: 0
       },
       attributes: ['user_id']
    });

    const existingUserIds = existingMembers.map(m => m.user_id);	  
   
    const newMembers = acceptedFriends.filter(friend => !existingUserIds.includes(friend.friend_id));
  
    const skippedMembers = acceptedFriends.filter(friend => existingUserIds.includes(friend.friend_id));

    const payload = newMembers.map(friend => ({
       group_id: data.group_id,
       group_reference_number: data.group_reference_number,
       user_id: friend.friend_id,
       reference_number: friend.friend_reference_number,
       role,
    }));

    const insertedMembers = await GroupMembers.bulkCreate(payload);

    const skippedReferenceNumbers = skippedMembers.map(f => f.friend_reference_number);

    if(newMembers.length === 0) {
       const skippedReferenceNumbers = acceptedFriends.map(f => f.friend_reference_number);
       return [false, `Already member[s] in the group. Skipped: ${skippedReferenceNumbers.join(', ')}`];
    }
    return [true,insertedMembers];
  } catch (error) {
    console.error('Error adding user to group:', error.message);
    return [false, error.message];
  }
};
*/
// Assumes models: Users, GroupMembers
// UNIQUE CONSTRAINT recommended: ALTER TABLE GroupMembers ADD CONSTRAINT uniq_group_user UNIQUE (group_id, user_id);

module.exports.addUserToGroup = async (data, openGroupInvite=0 ,role = 'member') => {
  try {
   // 1) validate input
    const refs = Array.isArray(data.member_reference_numbers) ? data.member_reference_numbers : [];
    if (refs.length === 0) return [false, 'member_reference_numbers must be a non-empty array'];

    // 2) defensive dedupe of incoming refs
    const inputRefs = Array.from(new Set(refs));

    // 3) resolve reference_numbers -> Users
    const users = await Users.findAll({
      where: { reference_number: { [Op.in]: inputRefs } }, // <-- IMPORTANT
      attributes: ['_id', 'email','reference_number','profile_picture_url','username','display_name'],
      raw: true
    });

    // refs that don’t map to users (send invites for these)
    const knownRefSet = new Set(users.map(u => u.reference_number));
    const toInvite = inputRefs.filter(r => !knownRefSet.has(r));

    // 4) figure out which resolved users are already in this group
    const candidateUserIds = Array.from(new Set(users.map(u => u._id)));
    let addedUsers = [];	  
    let addedCount = 0;
    let skippedRefs = [];

    if (candidateUserIds.length > 0) {
      const existing = await GroupMembers.findAll({
        where: {
          group_id: data.group_id,
          user_id: { [Op.in]: candidateUserIds },          // <-- IMPORTANT
          is_deleted: 0
        },
        attributes: ['user_id'],
        raw: true
      });

      const existingIds = new Set(existing.map(e => e.user_id));
      const newUsers = users.filter(u => !existingIds.has(u._id));
      const already = users.filter(u => existingIds.has(u._id));
      skippedRefs = already.map(u => u.reference_number);

      // 5) build payload (dedupe in-memory across group/user)
      if (newUsers.length > 0) {
        const payload = Array.from(
          new Map(
            newUsers.map(u => [
              `${data.group_id}:${u._id}`,
              {
                group_id: data.group_id,
                group_reference_number: data.group_reference_number,
                user_id: u._id,
                reference_number: u.reference_number,
		name: u.username || u.display_name,      
		profile_picture_url: u.profile_picture_url,      
                role,
		is_active: data.group_type === 'open' && openGroupInvite === 0 ? 1 : 0      
              }
            ])
          ).values()
        );

        // 6) insert
        await GroupMembers.bulkCreate(payload, { ignoreDuplicates: true });

	const confirm = await GroupMembers.findAll({
           where:{
              group_id: data.group_id,
              user_id: { [Op.in]: newUsers.map(u => u._id) },
              is_deleted: 0
	   },
           attributes: ['user_id'],
           raw: true		
	});
        const confirmedIds = new Set(confirm.map(r => r.user_id));
        addedUsers = newUsers.filter(u => confirmedIds.has(u._id));
        addedCount = addedUsers.length;	
      }
    }

    const result = {
      added_count: addedCount,
      added_users: addedUsers.map(u => ({ id: u._id, email: u.email ,reference_number: u.reference_number })),	    
      skipped_already_members: skippedRefs,      // these users were already in the group
      to_invite_reference_numbers: toInvite      // these refs had no matching user -> send invite link
    };

    // still OK if nothing added but there are invites to send
    if (result.added_count === 0 && result.to_invite_reference_numbers.length === 0) {
      return [false, 'No users added and no users to invite. Check the provided reference numbers.'];
    }
    
    return [true, result];	  

  } catch (error) {
    console.error('Error adding user to group:', error.message);
    return [false, error.message];
  }
};
