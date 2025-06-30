const { db2 } = require("../../../models");

const Wall = db2.wall;

module.exports.saveSocialPost = async (data) => {
  try{ 
    if(data.post_type !== 'social-board' || data.post_type !== 'social-ai-board' ){
     // return [false,"Invalid post_type. Only 'social-board' or 'social-ai-board' posts can be saved using this method."];
    }

    if (!data.media_url) {
      return [false,"media_url is required for social-board posts."];
    }

    data.item_amount = data.item_amount || 0;
    console.log('FFFFFFFFFF SOCIAL POST',data);
    const newPost = await Wall.create({
      user_id: data.user_id,
      email: data.email || null,
      username: data.username,
      profile_image_url: data.profile_image_url,	    
      reference_number: data.reference_number || null,
      username: data.username,
      profile_image_url: data.profile_image_url,	    
      location_name: data.location_name,
      media_url: data.media_url,
      description: data.caption,
      item_amount: 0.00,
      post_type: data.post_type || 'social-board',
      created_at: data.created_at || new Date(),
      category: data.category || null,
      is_buy_enabled: data.is_buy_enabled,
      is_comment_allowed: data.is_comment_allowed,	    
      is_minted_automatically: data.is_minted_automatically,	    
      is_public: 1,	    
      is_deleted: 0,
    });

    return [true,newPost];
  } catch (error) {
    console.error('Error saving social-board post:', error.message);
    return [false,error.message];
  }
};
