const { db2 } = require("../../../models");

const Wall = db2.wall;

const addBuyItem = async (data) => {
  try {

    if(data.post_type !== 'cross-list' || data.post_type !== 'show-wall' ){
      return [false,"Invalid post_type. Only 'social-board' posts can be saved using this method."];
    }

    if (!data.media_url) {
      return [false,"media_url is required for an item listed for sale."];
    }

    data.item_amount = data.item_amount || 0;

    const newPost = await Wall.create({
      user_id: data.user_id,
      email: data.email || null,
      reference_number: data.reference_number || null,
      media_url: data.media_url,
      description: data.description,
      item_amount: data.item_amount,
      post_type: 'show-wall',
      created_at: data.created_at || new Date(),
      is_public: 0,	    
      is_deleted: 0,
    });

    return [true,newPost];
  } catch (error) {
    console.error('Error saving show-wall post:', error.message);
    return [false,error.message];
  }
};
