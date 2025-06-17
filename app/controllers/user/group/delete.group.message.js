const { db2 } = require("../../../models");

const Messages = db2.messages;

module.exports.deleteMessage = async(message_id, user_id) => {
  try {
    await Messages.update(
      { deleted: true },
      { where: { message_id, user_id } }
    );

    return [true, 'Message deleted successfully'];
  } catch (error) {
    console.error('Error deleting message:', error.message);
    return [false, error.message];
  }
};
