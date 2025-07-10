const { db2 } = require("../../../models");

const ChatGroups = db2.groups;

module.exports.groupExist = async(invite_link) => {
  try {
    const group = await ChatGroups.findOne({ where: { invite_link, is_deleted: 0 }});

    return [true, group];
  } catch (error) {
    console.error('Error adding user to group:', error.message);
    return [false, error.message];
  }
};
