const { db2 } = require("../../../models");

const Comments = db2.comments;

module.exports.removeComment = async (commentId) => {
  try {
    const deletedRows = await Comments.update(
      { is_deleted: 1 },
      {
        where: {
          comment_id: commentId,
          is_deleted: 0,
        },
      }
    );

    if (deletedRows[0] > 0) {
      console.log(`Comment with ID ${commentId} marked as deleted.`);
      return [true,'Comment deleted successfully.'];
    } else {
      console.log(`No matching comment found with ID ${commentId}.`);
      return [false,'No matching comment found to delete.'];
    }
  } catch (error) {
    console.error('Error deleting comment:', error.message);
    return [false, error.message];
  }
};
/*
 *
     const deletedRows = await Likes.destroy(
      {
        where: {
          like_id: likeData.like_id
        },
      }
    );

    if (deletedRows > 0) {
      console.log(`Like with ID ${likeData.like_id} successfully deleted.`);
      return [true,'Like deleted successfully.'];
    } else {
      console.log(`No matching comment found with ID ${likeData.like_id}.`);
      return [false,'No matching like found to delete.'];
    }

 *
 *
 * */
