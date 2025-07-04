const { db2 } = require("../../../models");

const SavedPosts = db2.saved_posts;

module.exports.savePost = async (data) => {
  try {
    const newSavedPost = await SavedPosts.create({
      post_id: data.post_id,
      user_id: data.user_id,
      email: data.email || null,
      reference_number: data.reference_number,
      created_at:  new Date(),
      is_updated: 0, // Default value
    });
    return [true,newSavedPost];
  } catch (error) {
    console.error('Error saving a post:', error.message);
    return [false,error.message];
  }
};
