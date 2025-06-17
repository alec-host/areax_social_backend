const { db2 } = require("../../../models");

const Messages = db2.messages;

module.exports.sendMessage = async(payload) => {
  try {
    const alignment = 'right';	  
    const newMessage = await Messages.create({
      group_id: payload.group_id,
      user_id: payload.user_id,
      content: payload.content,
      media_url: payload.media_url,
      alignment_flag: alignment	    
    });

    return [true, newMessage];
  } catch (error) {
    console.error('Error sending message:', error.message);
    return [false, error.message];
  }
};
