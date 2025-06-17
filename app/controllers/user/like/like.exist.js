const { db2 } = require("../../../models");

const Likes = db2.likes;

module.exports.likeExist = async (likeData) => {
  try {
    // Count the number of likes matching the reference_number
    const likeCount = await Likes.count({
      where: {
        reference_number: likeData.reference_number,
      },
    });

    // Return the result
    return [true, likeCount]; // Return the count of matching rows
  } catch (error) {
    console.error('Error checking like existence:', error.message);
    return [false, error.message]; // Return error details
  }
};
