const { db2 } = require("../../../models");

//const Groups = db2.groups;
const GroupInvites = db2.groups.invites;

module.exports.groupInviteLinkExist = async(invite_code) => {
  try {
    const groupInvite = await GroupInvites.findOne({ where: { token:invite_code, status: 'pending' }});
    if(!groupInvite){
       return [false,`Group with invite code: ${invite_code} does not exist or has been deleted`];
    }
    return [true, groupInvite];
  } catch (error) {
    console.error('Error adding user to invite group list:', error.message);
    return [false, error.message];
  }
};
