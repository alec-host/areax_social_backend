const { db2 } = require("../../../models");

const Likes = db2.likes;

module.exports.fetchLikesByPostIds = async (postIds) => {
  try {
       const records = await Likes.findAll({
          attributes:['post_id','like_id','user_id'],
          where:{
             post_id: postIds,
          },
	  raw: true,
       });
       return records;
  } catch(error) {
    console.error('Error fetching likes:', error);
    return null;
  }
};
