const { db2 } = require("../../../models");

const Messages = db2.messages;

module.exports.getGroupChats = async (group_id, limit = 50) => {
  try {
    const chats = await Messages.findAll({
      where: { group_id },
      order: [['sent_at', 'DESC']], // Recent messages first
      limit,
    });

    return [true, chats];
  } catch (error) {
    console.error('Error fetching group chats:', error.message);
    return [false, error.message];
  }
};
