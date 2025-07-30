const { db2 } = require("../../../models");

const Comments = db2.comments;

module.exports.fetchCommentsByPostIds = async(postIds) => {
  try {
    const comments = await Comments.findAll({
      where: {
        post_id: postIds,
        is_deleted: 0,
        parent_comment_id: null
      },
      attributes: ['post_id','comment_id', 'user_id','comment_text'],
      raw: true,
    });
    return comments;
  } catch (error) {
    console.error('Error fetching comments:', error.message);
    return null;
  }
};
