const { db2 } = require("../../../models");

const CommentLikes = db2.comments.likes;

module.exports.addCommentLike = async (likeData) => {
  try {
    const newLike = await CommentLikes.create({
      comment_id: likeData.comment_id,
      user_id: likeData.user_id,
      email: likeData.email || null,
      reference_number: likeData.reference_number,
      created_at:  new Date(),
    });
    return [true,newLike];
  } catch (error) {
    console.error('Error adding comment like:', error.message);
    return [false,error.message];
  }
};
