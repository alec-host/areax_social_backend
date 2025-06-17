const { db2 } = require("../../../models");

const Messages = db2.messages;

module.exports.editMessage = async(payload) => {
  try {
    const user_id = payload.user_id;	  
    const message_id = payload.message_id;	  
    const updatedMessage = await Messages.update(
      { content: payload.content, edited: true },
      { where: { message_id, user_id } }
    );

    return [true, updatedMessage];
  } catch (error) {
    console.error('Error editing message:', error.message);
    return [false, error.message];
  }
};
