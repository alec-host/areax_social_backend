const { db2 } = require("../../../models");

const SavedPosts = db2.saved_posts;

module.exports.savedPostExist = async (data) => {
  try {
    // Count the number of likes matching the reference_number
    const savedPostCount = await SavedPosts.count({
      where: {
        reference_number: data.reference_number,
        post_id: data.post_id
      },
    });

    // Return the result
    return [true, savedPostCount]; // Return the count of matching rows
  } catch (error) {
    console.error('Error checking like existence:', error.message);
    return [false, error.message]; // Return error details
  }
};
