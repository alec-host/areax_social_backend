const { db2 } = require("../../../models");

const Comments = db2.comments;

module.exports.getCommentCountById = async(commentId) => {
    const count = await Comments.count({where:{comment_id:commentId}});
    return count;
};
