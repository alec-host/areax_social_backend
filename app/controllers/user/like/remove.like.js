const { db2 } = require("../../../models");

const Likes = db2.likes;

module.exports.removeLike = async (likeData) => {	
  try {
    const deletedRows = await Likes.destroy(
      {
        where: {
          like_id: likeData.like_id,
	  email: likeData.email,
          reference_number: likeData.reference_number		
        },
      }
    );

    if (deletedRows > 0) {
      console.log(`Like with ID ${likeData.like_id} successfully deleted.`);
      return [true,'Like has been removed successfully.'];
    } else {
      console.log(`No matching comment found with ID ${likeData.like_id}.`);
      return [false,'No matching like found to delete.'];
    }
  } catch (error) {
    console.error('Error deleting like:', error.message);
    return [false, error.message];
  }
};
