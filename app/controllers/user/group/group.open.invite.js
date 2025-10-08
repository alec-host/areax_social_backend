const { db2 } = require("../../../models");

const Groups = db2.groups;

module.exports.groupOpenInviteLinkExist = async(invite_link) => {
  try {
    const groupInvite = await Groups.findOne({ where: { invite_link }});
    if(!groupInvite){
       return [false,`Group with invite code: ${invite_link} does not exist or has been deleted`];
    }
    return [true, groupInvite];
  } catch (error) {
    console.error('Error reading info from a group:', error.message);
    return [false, error.message];
  }
};
