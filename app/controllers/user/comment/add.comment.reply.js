const { db2 } = require("../../../models");

const Comments = db2.comments;

module.exports.addCommentReply = async (commentData) => {
  try {
    const newComment = await Comments.create({
      post_id: commentData.post_id,
      user_id: commentData.user_id,
      reference_number: commentData.reference_number,
      parent_comment_id: commentData.comment_id,	    
      commentor_email: commentData.commentor_email || null,
      commentor_reference_number: commentData.commentor_reference_number,
      commentor_profile_url_image: commentData.commentor_profile_url_image,
      commentor_username: commentData.commentor_username || null,
      comment_text: commentData.comment_text,
      created_at: new Date(),
      is_edited: 0, // Default value
      is_deleted: 0, // Default value
    });

    console.log('Comment to reply added successfully:');
    return [true,newComment];
  } catch (error) {
    console.error('Error adding a reply to comment:', error.message);
    return [false,error.message];
  }
};
