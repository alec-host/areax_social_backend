const { db2 } = require("../../../models");

const ChatGroups = db2.groups;

module.exports.isGroupAdmin = async (reference_number) => {
  try {
    const groupAdminExist = await ChatGroups.count({
       where: { admin_reference_number: reference_number},
    });
    if(groupAdminExist === 0){
       return [false, groupAdminExist];
    }
    return [true, groupAdminExist];
  } catch (error) {
    console.error('Error fetching group admin exist:', error.message);
    return [false, error.message];
  }
};
