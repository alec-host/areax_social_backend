module.exports.likedPost = async(posts,likes) => {	
   const post_ids = posts.map(p => p.post_id);
   const likedPostIds = new Set(likes.map(l => l.post_id));
   //console.log('VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVvvvvvvvvv ',likedPostIds);	
   const response = posts.map(post => ({
      post_id: post.post_id,
      user_id: post.user_id,
      email: post.email,
      reference_number: post.reference_number,	   
      username: post.username,
      profile_image_url: post.profile_image_url,
      media_url: post.media_url,
      description: post.description,
      item_amount: post.item_amount,
      gps_coordinates: post.gps_coordinates,
      location_name: post.location_name,
      post_type: post.post_type,
      bid_type: post.bid_type,
      bid_close_time: post.bid_close_time,
      category: post.category,
      type: post.type,
      created_at: post.created_at,
      is_liked: likedPostIds.has(post.post_id), 
      is_saved: post.is_saved,
      is_flagged: post.is_flagged,	   
      is_buy_enabled: post.is_buy_enabled,
      is_comment_allowed: post.is_comment_allowed,
      is_minted_automatically: post.is_minted_automatically,
      is_public: post.is_public,
      is_deleted: post.is_deleted,
   }));
   //console.log('VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVvvvvvvvvv ',response);	
   return response;
};
