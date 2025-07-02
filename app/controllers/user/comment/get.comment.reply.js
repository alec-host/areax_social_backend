const { db2 } = require("../../../models");

const Comments = db2.comments;

module.exports.getCommentRepliesByCommentId = async (commentId, limit = 10, offset = 0) => {
  try {
    const commentReplies = await Comments.findAll({
      where: {
        parent_comment_id: commentId,
        is_deleted: 0,
      },
      attributes: ['comment_id', 'commentor_email', 'commentor_reference_number','commentor_profile_url_image', 'commentor_username', 'comment_text', 'created_at', 'is_edited'],
      order: [['created_at', 'DESC']],
      limit: limit,
      offset: offset,
    });
    console.log(`Comments reply retrieved for comment ID ${commentId}`);
    if(commentReplies.length === 0){
       return [false,'No comment replies'];
    }
    return [true,commentReplies];
  } catch (error) {
    console.error('Error fetching comment replies:', error.message);
    return [false,error.message];
  }
};
