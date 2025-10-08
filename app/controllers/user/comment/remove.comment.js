const { db2 } = require("../../../models");

const Comments = db2.comments;

module.exports.removeComment = async (commentId) => {
  try {
    /*	  
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
    */
    const deletedRows = await Comments.destroy(
      {
        where: {
          comment_id: commentId,
          is_deleted: 0,
        },
      }
    );

    if (deletedRows > 0) {
      console.log(`Comment with ID ${commentId} has been deleted.`);
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
