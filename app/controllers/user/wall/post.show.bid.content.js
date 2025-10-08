const { db2 } = require("../../../models");

const Wall = db2.wall;

module.exports.saveShowOpenBidPost = async(data) => {
  try {
    const newPost = await Wall.create({
      user_id: data.user_id,
      email: data.email || null,
      reference_number: data.reference_number,
      username: data.username,
      profile_image_url: data.profile_image_url,	    
      media_url: data.media_url,
      type: data.type,	    
      description: data.caption || '',
      item_amount: data.item_amount || 0.00,
      post_type: data.post_type || 'show-board',
      created_at: data.created_at || new Date(),
      bid_type: 'open',	 
      is_comment_allowed: 0,	    
      is_minted_automatically: 0,	    
      is_public: 1,
      is_deleted: 0,
    });
    return [true,newPost];
  } catch (error) {
    console.error('Error saving show-board post:', error.message);
    return [false,error.message];
  }
};

module.exports.saveShowClosedBidPost = async(data) => {	
  try {
    const newPost = await Wall.create({
      user_id: data.user_id,
      email: data.email || null,
      reference_number: data.reference_number,
      username: data.username,
      profile_image_url: data.profile_image_url,	    
      media_url: data.media_url,
      type: data.type,	    
      description: data.caption || '',
      item_amount: data.item_amount || 0.00,
      post_type: data.post_type || 'show-board',
      created_at: data.created_at || new Date(),
      bid_type: 'closed',
      bid_close_time: data.closed_time || new Date(),	 
      is_comment_allowed: 0,	    
      is_minted_automatically: 0,	    
      is_public: 0,
      is_deleted: 0,
    });
    return [true,newPost];
  } catch (error) {
    console.error('Error saving show-board post:', error.message);
    return [false,error.message];
  }
};
