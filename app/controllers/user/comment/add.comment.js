const { db2 } = require("../../../models");

const Comments = db2.comments;

module.exports.addComment = async (commentData) => {
  try {
    const newComment = await Comments.create({
      post_id: commentData.post_id,
      user_id: commentData.user_id,
      reference_number: commentData.reference_number,
      commentor_email: commentData.commentor_email || null,
      commentor_reference_number: commentData.commentor_reference_number,
      comment_text: commentData.comment_text,
      created_at: new Date(),	    
      is_edited: 0, // Default value
      is_deleted: 0, // Default value
    });

    console.log('Comment added successfully:', newComment);
    return [true,newComment];
  } catch (error) {
    console.error('Error adding comment:', error.message);
    return [false,error.message];
  }
};
