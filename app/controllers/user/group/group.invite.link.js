const { db2 } = require("../../../models");

const Groups = db2.groups;

module.exports.groupInviteLinkExist = async(invite_link) => {
  try {
    const group = await Groups.findOne({ where: { invite_link, is_deleted: 0 }});
    if(!group){
       return [false,`Group with invite code: ${invite_link} does not exist or has been deleted`];
    }
    return [true, group];
  } catch (error) {
    console.error('Error adding user to group:', error.message);
    return [false, error.message];
  }
};
