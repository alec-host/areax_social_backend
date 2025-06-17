const { db2 } = require("../../../models");
const { Sequelize } = require("sequelize");

const FriendRequests = db2.queued_friends_requests;

module.exports.queueFriendRequest = async(friendRequestData) => {
  try {
    const queueFriendRequest = await FriendRequests.create({
        reference_number: friendRequestData.reference_number,
        originator_reference_number: friendRequestData.originator_reference_number,	    
        originator_name: friendRequestData.originator_name,
	originator_caption: friendRequestData.originator_caption,    
        originator_profile_picture_url: friendRequestData.originator_profile_picture_url,
        created_at: new Date().toISOString()
    });

    return [true,'Friend request queued.'];
  } catch (error) {
    console.error('Error queue friend request:', error.message);
    return [false,`Error queue friend request: ${error.message}`];
  }
};
