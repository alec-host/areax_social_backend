const { db2 } = require("../../../models");

const Likes = db2.likes;

module.exports.addLike = async (likeData) => {
  try {
    const newLike = await Likes.create({
      post_id: likeData.post_id,
      user_id: likeData.user_id,
      email: likeData.email || null,
      reference_number: likeData.reference_number,
      created_at:  new Date(),	    
      is_updated: 0, // Default value
    });

    //console.log('Like added successfully:', newLike);
    return [true,newLike];
  } catch (error) {
    console.error('Error adding like:', error.message);
    return [false,error.message];
  }
};
