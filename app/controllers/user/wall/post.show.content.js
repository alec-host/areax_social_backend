const { db2 } = require("../../../models");

const Wall = db2.wall;

module.exports.saveShowPost = async(data) => {
  try {
 
    const newPost = await Wall.create({
      user_id: data.user_id,
      email: data.email || null,
      reference_number: data.reference_number,
      username: data.username, 	    
      media_url: data.media_url,
      description: data.caption || '',
      location_name: data.location_name || '',	    
      item_amount: data.item_amount || 0.00,
      post_type: data.post_type,
      created_at: data.created_at || new Date(),
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
