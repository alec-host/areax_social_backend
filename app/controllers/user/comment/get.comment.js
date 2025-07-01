const { db2 } = require("../../../models");

const Comments = db2.comments;

module.exports.getCommentsByPostId = async (postId, limit = 10, offset = 0) => {
  try {
    const comments = await Comments.findAll({
      where: {
        post_id: postId,
        is_deleted: 0,
      },
      attributes: ['comment_id', 'commentor_email', 'commentor_reference_number','commentor_profile_url_image', 'commentor_username', 'comment_text', 'created_at', 'is_edited'],
      order: [['created_at', 'DESC']],
      limit: limit,
      offset: offset,
    });
    console.log(`Comments retrieved for post ID ${postId}`);
    if(comments.length === 0){
       return [false,'No comments'];	    
    }	  
    return [true,comments];
  } catch (error) {
    console.error('Error fetching comments:', error.message);
    return [false,error.message];
  }
};
