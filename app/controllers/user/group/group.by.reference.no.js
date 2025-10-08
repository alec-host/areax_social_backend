const { db2 } = require("../../../models");

const Groups = db2.groups;

module.exports.groupByReferenceNumber = async(group_reference_number) => {
  try {
    const group = await Groups.findOne({ where: { group_reference_number, is_deleted: 0 }});
    if(!group){
       return [false, `Group with ID ${group_reference_number} does not exist or has been deleted`];
    }
    return [true, group];
  } catch (error) {
    console.error('Error getting a group:', error.message);
    return [false, error.message];
  }
};
