const { db2 } = require("../../../models");

const Wall = db2.wall;

module.exports.saveSharePost = async (data) => {
  try {

    if(data.post_type !== 'social-board'){
      return [false,"Invalid post_type. Only 'social-board' posts can be saved using this method."];
    }

    if (!data.media_url) {
      return [false,"media_url is required for social-board posts."];
    }

    data.item_amount = data.item_amount || 0;

    const newPost = await Wall.create({
      user_id: data.user_id,
      email: data.email || null,
      reference_number: data.reference_number || null,
      media_url: data.media_url,
      description: data.caption,
      item_amount: 0.00,
      post_type: 'social-board',
      created_at: data.created_at || new Date(),
      is_public: 0,	    
      is_deleted: 0,
    });

    return [true,newPost];
  } catch (error) {
    console.error('Error saving social-board post:', error.message);
    return [false,error.message];
  }
};
