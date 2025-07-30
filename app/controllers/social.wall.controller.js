const { validationResult } = require("express-validator");
const { findUserCountByEmail } = require("./user/find.user.count.by.email");
const { findUserCountByReferenceNumber } = require("./user/find.user.count.by.reference.no");
const { getUserDetailByReferenceNumber } = require("./user/get.user.details");
const { getWallRecords } = require("./user/wall/get.wall");
const { getGroupWallRecords } = require("./user/wall/get.group.wall");
const { getWallRecordsByReferenceNumber } = require("./user/wall/get.wall.by.reference.number");
const { saveShowPost } = require("./user/wall/post.show.content");
const { saveSocialPost } = require("./user/wall/post.social.content");
const { saveSharePost } = require("./user/wall/post.share.content");
const { removeSocialPost } = require("./user/wall/remove.social.post");
const { saveShowOpenBidPost,saveShowClosedBidPost } = require("./user/wall/post.show.bid.content");
const { uploadImageToCustomStorage } = require("../services/CUSTOM-STORAGE");
const { addTimeToCurrentDate } = require("../utils/future.date.time");
const { likedSavedReportedPost } = require("../utils/liked.saved.reported.post");
const { getUserLikes } = require("./user/like/get.user.likes");
const { getUserSavedPosts } = require("./user/saved/get.user.saved.post");
const { getUserReportedPosts } = require("./user/wall/get.user.reported.posts");
const { getReportedPosts } = require("./user/wall/get.reported.posts");
const { groupByReferenceNumber } = require("./user/group/group.by.id");

const { connectToRedis, closeRedisConnection, setSocialWallCache, getSocialWallCache, setUserDataCache, getUserDataCache,invalidatePostCache, invalidateUserCache } = require("../cache/redis");

const { SYSTEM_USER_EMAIL, SYSTEM_USER_REFERENCE_NUMBER } = require("../constants/app_constants");

module.exports.GetWallContent = async(req,res) => {
  let redisClient = null;	
  const errors = validationResult(req);
  const { email, reference_number, post_type, page, limit } = req.query;
  if(!errors.isEmpty()){
     return res.status(422).json({ success: false, error: true, message: errors.array() });	  
  }
  try{
     redisClient = await connectToRedis();

     const email_found = await findUserCountByEmail(email);
     if(email_found === 0){
        res.status(404).json({
            success: false,
            error: true,
            message: "Email not found."
        });	     
        return;
     }

     const reference_number_found = await findUserCountByReferenceNumber(reference_number);
     if(reference_number_found === 0){
        res.status(404).json({
            success: false,
            error: true,
            message: "Reference number not found."
        });	     
	return;     
     }
     const is_public = 'everyone';
     const cachedData = await getSocialWallCache(
        redisClient, 
        post_type, 
        is_public, 
        page, 
        limit, 
        email, 
        reference_number
     );

     if(cachedData){
        console.log('Serving from cache');
        return res.status(200).json({
           success: true,
           error: false,
           data: cachedData.socialPosts,
           pagination: cachedData.pagination,
           message: "List of social wall post[s] (cached)."
        });
     }

     // Try to get cached user data first
     const [cachedLikes, cachedSaved, cachedReported] = await Promise.all([
        getUserDataCache(redisClient, 'user_likes', email, reference_number),
        getUserDataCache(redisClient, 'user_saved', email, reference_number),
        getUserDataCache(redisClient, 'user_reported', email, reference_number)
     ]);	

     // Fetch data from database
     const [postResp, likeresp, savedPostResp, reportedPostResp] = await Promise.all([
        getWallRecords(post_type, is_public, page, limit),
        cachedLikes ? Promise.resolve([true, cachedLikes]) : getUserLikes(email, reference_number),
        cachedSaved ? Promise.resolve([true, cachedSaved]) : getUserSavedPosts(email, reference_number),
        cachedReported ? Promise.resolve([true, cachedReported]) : getUserReportedPosts(email, reference_number)
     ]);	  
	 
     if(!postResp[0]) {
        return res.status(400).json({
           success: false,
           error: true,
           message: "Error: fetching social wall post[s]."
        });
     }	  
    	  
     /*	  
     const postResp = await getWallRecords(post_type,is_public,page,limit);
     const likeresp = await getUserLikes(email,reference_number);
     const savedPostResp = await getUserSavedPosts(email,reference_number);
     const reportedPostResp = await getUserReportedPosts(email,reference_number);
     const socialPosts = await likedSavedReportedPost(postResp[1].data,likeresp[1],savedPostResp[1],reportedPostResp[1]);		  
     if(postResp[0]){
        res.status(200).json({
            success: true,
            error: false,
	    data: socialPosts,	
	    pagination: {
	       total: parseInt(postResp[1].total),
	       current_page: parseInt(postResp[1].currentPage),   	   
	       total_pages: parseInt(postResp[1].totalPages)	    
	    },		
            message: "List of social wall post[s]."
        });
     }else{
        res.status(400).json({
            success: false,
            error: true,
            message: "Error: fetching social wall post[s]."
        });
     }
     */
     const socialPosts = await likedSavedReportedPost(
        postResp[1].data,
        likeresp[1],
        savedPostResp[1],
        reportedPostResp[1]
     ); 
	  
     const responseData = {
        socialPosts,
        pagination: {
           total: parseInt(postResp[1].total),
           current_page: parseInt(postResp[1].currentPage),
           total_pages: parseInt(postResp[1].totalPages)
        }
     };    
        
     // Cache the response
     await setSocialWallCache(
        redisClient,
        post_type, 
        is_public, 
        page, 
        limit, 
        email, 
        reference_number, 
        responseData
     );

     // Cache user-specific data
     await Promise.all([
        setUserDataCache(redisClient, 'user_likes', email, reference_number, likeresp[1]),
        setUserDataCache(redisClient, 'user_saved', email, reference_number, savedPostResp[1]),
        setUserDataCache(redisClient, 'user_reported', email, reference_number, reportedPostResp[1])
     ]);

     res.status(200).json({
         success: true,
         error: false,
         data: socialPosts,
         pagination: responseData.pagination,
         message: "List of social wall post[s]."
     });	  
  }catch(e){
     if(e){
        res.status(500).json({
            success: false,
            error: true,
            message: e?.response?.message || e?.message || 'Something wrong has happened'
        });
     }
  }finally{
     if(redisClient) {
        await closeRedisConnection(redisClient);
     }
  }
};

module.exports.GetGroupWallContent = async(req,res) => {
  let redisClient = null;
  const errors = validationResult(req);
  const { email, reference_number, post_type, page, limit } = req.query;
  if(!errors.isEmpty()){
     return res.status(422).json({ success: false, error: true, message: errors.array() });
  }
  try{
     redisClient = await connectToRedis();

     const email_found = await findUserCountByEmail(email);
     if(email_found === 0){
        res.status(404).json({
            success: false,
            error: true,
            message: "Email not found."
        });
        return;
     }

     const reference_number_found = await findUserCountByReferenceNumber(reference_number);
     if(reference_number_found === 0){
        res.status(404).json({
            success: false,
            error: true,
            message: "Reference number not found."
        });
        return;
     }
     const is_public = 'private';
     const cachedData = await getSocialWallCache(
        redisClient,
        post_type,
        is_public,
        page,
        limit,
        email,
        reference_number
     );

     if(cachedData){
        console.log('Serving from cache');
        return res.status(200).json({
           success: true,
           error: false,
           data: cachedData.groupPosts,
           pagination: cachedData.pagination,
           message: "List of group post[s] (cached)."
        });
     }

     // Try to get cached user data first
     const [cachedLikes, cachedSaved, cachedReported] = await Promise.all([
        getUserDataCache(redisClient, 'user_group_likes', email, reference_number),
        getUserDataCache(redisClient, 'user_group_saved', email, reference_number),
        getUserDataCache(redisClient, 'user_group_reported', email, reference_number)
     ]);

     // Fetch data from database
     const [postResp, likeresp, savedPostResp, reportedPostResp] = await Promise.all([
        getGroupWallRecords(post_type, is_public, page, limit),
        cachedLikes ? Promise.resolve([true, cachedLikes]) : getUserLikes(email, reference_number),
        cachedSaved ? Promise.resolve([true, cachedSaved]) : getUserSavedPosts(email, reference_number),
        cachedReported ? Promise.resolve([true, cachedReported]) : getUserReportedPosts(email, reference_number)
     ]);

     if(!postResp[0]) {
        return res.status(400).json({
           success: false,
           error: true,
           message: "Error: fetching group post[s]."
        });
     }
	  
     const groupPosts = await likedSavedReportedPost(
        postResp[1].data,
        likeresp[1],
        savedPostResp[1],
        reportedPostResp[1]
     );

     const responseData = {
        groupPosts,
        pagination: {
           total: parseInt(postResp[1].total),
           current_page: parseInt(postResp[1].currentPage),
           total_pages: parseInt(postResp[1].totalPages)
        }
     };

     // Cache the response
     await setSocialWallCache(
        redisClient,
        post_type,
        is_public,
        page,
        limit,
        email,
        reference_number,
        responseData
     );

     // Cache user-specific data
     await Promise.all([
        setUserDataCache(redisClient, 'user_group_likes', email, reference_number, likeresp[1]),
        setUserDataCache(redisClient, 'user_group_saved', email, reference_number, savedPostResp[1]),
        setUserDataCache(redisClient, 'user_group_reported', email, reference_number, reportedPostResp[1])
     ]);

     res.status(200).json({
         success: true,
         error: false,
         data: groupPosts,
         pagination: responseData.pagination,
         message: "List of group post[s]."
     });
  }catch(e){
     if(e){
        res.status(500).json({
            success: false,
            error: true,
            message: e?.response?.message || e?.message || 'Something wrong has happened'
        });
     }
  }finally{
     if(redisClient) {
        await closeRedisConnection(redisClient);
     }
  }
};

module.exports.GetWallContentByReferenceNumber = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number, post_type } = req.body;
  if(!errors.isEmpty()){
     return res.status(422).json({ success: false, error: true, message: errors.array() });	  
  }
  try{
     const email_found = await findUserCountByEmail(email);
     if(email_found === 0){
        res.status(404).json({
            success: false,
            error: true,
            message: "Email not found."
        });
        return;	     
     }
     const reference_number_found = await findUserCountByReferenceNumber(reference_number);
     if(reference_number_found === 0){
        res.status(404).json({
            success: false,
            error: true,
            message: "Reference number not found."
        });
        return;	     
     }
     const response = await getWallRecordsByReferenceNumber(reference_number,post_type);	
     if(response[0]){	
        res.status(200).json({
            success: true,
            error: false,
            message: "List of my social wall post[s]."
        });
     }else{
        res.status(400).json({
            success: false,
            error: true,
            message: "Error: fetching my socail wall post[s]."
        }); 
     }
  }catch(e){
     if(e){
        res.status(500).json({
            success: false,
            error: true,
            message: e?.response?.message || e?.message || 'Something wrong has happened'
        });
     }
   }
};

module.exports.SaveShowContent = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number, media_url, caption, item_amount, gps_coordinates, location_name, share_on_social_wall, is_buy_enabled, is_comment_allowed, is_minted_automatically } = req.body;
  const file = req.file ? req.file : null;	
  let redisClient = null;	
  if(!errors.isEmpty()){
     return res.status(422).json({ success: false, error: true, message: errors.array() });	  
  }
  try{
      const email_found = await findUserCountByEmail(email);
      if(email_found === 0){
         res.status(404).json({
             success: false,
             error: true,
             message: "Email not found."
         });
         return;	      
      }
      const reference_number_found = await findUserCountByReferenceNumber(reference_number);
      if(reference_number_found === 0){
         res.status(404).json({
             success: false,
             error: true,
             message: "Reference number not found."
         });
	 return;     
      }
      const userDetail = await getUserDetailByReferenceNumber(reference_number);
      let image_url;	
      if(file){
         image_url = await uploadImageToCustomStorage(file?.filename);	
      }else{
	 image_url = null;
      }
      const payload = {
         user_id: userDetail._id,
         email,
         reference_number,
         username: userDetail.display_name,
         profile_image_url: userDetail.profile_picture_url,			     
         media_url: image_url || media_url,
         caption,
         item_amount,
         gps_coordinates,
         location_name,     
	 post_type: share_on_social_wall === 0 ? 'show-board' : 'cross-board',
         is_buy_enabled: is_buy_enabled,			     
         is_comment_allowed: is_comment_allowed,
	 is_minted_automatically: is_minted_automatically,     
      };
      const response = await saveShowPost(payload);
      if(!response[0]){
         res.status(400).json({
             success: false,
             error: true,
             message: response[1]
         });
         return;
      }
	 
      redisClient = await connectToRedis();
      await invalidatePostCache(redisClient,response[1]?.post_id);
      await invalidateUserCache(redisClient,email,reference_number);
	  
      res.status(200).json({
          success: true,
          error: false,
          message: "Content posted successfully."
      });
  }catch(e){
      if(e){
         res.status(500).json({
             success: false,
             error: true,
             message: e?.response?.message || e?.message || 'Something wrong has happened'
         });
      }
  }finally{
     if(redisClient) {
        await closeRedisConnection(redisClient);
     }
  }
};

module.exports.SaveSocialContent = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number, media_url, gps_coordinates, caption, location_name, is_buy_enabled, is_comment_allowed, is_minted_automatically } = req.body;
  const file = req.file ? req.file : null;	
  let redisClient = null;	
  if(!errors.isEmpty()){
     return res.status(422).json({ success: false, error: true, message: errors.array() });	  
  }
  try{
      const email_found = await findUserCountByEmail(email);
      if(email_found === 0){
         res.status(404).json({
             success: false,
             error: true,
             message: "Email not found."
         });
         return;
      }
      const reference_number_found = await findUserCountByReferenceNumber(reference_number);
      if(reference_number_found === 0){
         res.status(404).json({
             success: false,
             error: true,
             message: "Reference number not found."
         });
         return;
      }
      const userDetail = await getUserDetailByReferenceNumber(reference_number);	
      let image_url;
      if(file){
         image_url = await uploadImageToCustomStorage(file?.filename);
      }else{
         image_url = null;
      }			
      const payload = { 
	 user_id: userDetail._id,
	 email,
	 reference_number,
         username: userDetail.display_name,
	 profile_image_url: userDetail.profile_picture_url,     
	 media_url: image_url || media_url,
	 caption,
	 location_name,     
	 gps_coordinates,     
	 post_type: 'social-board',
	 is_buy_enabled: is_buy_enabled,
	 is_comment_allowed: is_comment_allowed,
	 is_minted_automatically: is_minted_automatically     
      };
		 
      const response = await saveSocialPost(payload);
      if(!response[0]){
         res.status(400).json({
             success: false,
             error: true,
             message: response[1]
         });
         return;
      }

      redisClient = await connectToRedis();
      await invalidatePostCache(redisClient,response[1]?.post_id);
      await invalidateUserCache(redisClient,email,reference_number);
      console.log(response[1]?.post_id);	  
      res.status(200).json({
          success: true,
          error: false,
          message: "Content posted successfully."
      });	
  }catch(e){
      if(e){
         res.status(500).json({
             success: false,
             error: true,
             message: e?.response?.message || e?.message || 'Something wrong has happened'
         });
      }
  }finally{
     if(redisClient) {
        await closeRedisConnection(redisClient);
     }
  }
};

module.exports.SaveGroupContent = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number, group_reference_number, media_url, gps_coordinates, caption, location_name, is_buy_enabled, is_comment_allowed, is_minted_automatically } = req.body;
  const file = req.file ? req.file : null;
  let redisClient = null;	
  if(!errors.isEmpty()){
     return res.status(422).json({ success: false, error: true, message: errors.array() });
  }	
  try{
      const email_found = await findUserCountByEmail(email);
      if(email_found === 0){
         res.status(404).json({
             success: false,
             error: true,
             message: "Email not found."
         });
         return;
      }
      const reference_number_found = await findUserCountByReferenceNumber(reference_number);
      if(reference_number_found === 0){
         res.status(404).json({
             success: false,
             error: true,
             message: "Reference number not found."
         });
         return;
      }
      const group = await groupByReferenceNumber(group_reference_number);
      if(!group[0]){
         res.status(404).json({
             success: false,
             error: true,
             message: group[1]
         });
         return;
      }
      const groupCount = await findGroupUserMemberShipCount(reference_number,group_reference_number);
      if(groupCount === 0){
         res.status(404).json({
             success: false,
             error: true,
             message: `User is not a member to a group with reference number: ${group_reference_number}.`
         });
         return;
      }	  
      const userDetail = await getUserDetailByReferenceNumber(reference_number);
      let image_url;
      if(file){
         image_url = await uploadImageToCustomStorage(file?.filename);
      }else{
         image_url = null;
      }
      const payload = {
         user_id: userDetail._id,
         email,
         reference_number,
         username: userDetail.display_name,
         profile_image_url: userDetail.profile_picture_url,
	 group_reference_number,     
         media_url: image_url || media_url,
         caption,
         location_name,
         gps_coordinates,
         post_type: 'group-board',
         is_buy_enabled: is_buy_enabled,
         is_comment_allowed: is_comment_allowed,
         is_minted_automatically: is_minted_automatically
      };
      const response = await saveSocialPost(payload);
      if(!response[0]){
         res.status(400).json({
             success: false,
             error: true,
             message: response[1]
         });
         return;
      }

      redisClient = await connectToRedis();
      await invalidatePostCache(redisClient,response[1]?.post_id);
      await invalidateUserCache(redisClient,email,reference_number);

      res.status(200).json({
          success: true,
          error: false,
          message: "Content posted successfully."
      });
  }catch(e){
      if(e){
         res.status(500).json({
             success: false,
             error: true,
             message: e?.response?.message || e?.message || 'Something wrong has happened'
         });
      }
  }finally{
     if(redisClient) {
        await closeRedisConnection(redisClient);
     }
  }
};

module.exports.SaveShareContent = async(req,res) => {
    const errors = validationResult(req);
    const { email, reference_number, media_url, caption, is_public } = req.body;
    const file = req.file ? req.file : null;	
    if(errors.isEmpty()){
        try{
            const email_found = await findUserCountByEmail(email);
            if(email_found > 0){
                const reference_number_found = await findUserCountByReferenceNumber(reference_number);
                if(reference_number_found > 0){
		     const userDetail = await getUserDetailByReferenceNumber(reference_number);	
                     let image_url;
                     if(file){
                         image_url = await uploadImageToCustomStorage(file?.filename);
                     }else{
                         image_url = null;
                     }			
                     const payload = {
                        user_id: userDetail._id,
                        email,
                        reference_number,
                        media_url: image_url || media_url,
                        caption,
			is_buy_enabled: 0,
			is_minted_automatically: 0,     
			is_public   
                     };
                     const response = await saveSharePost(payload);
                     if(response[0]){
                        res.status(200).json({
                            success: true,
                            error: false,
                            message: "Content posted successfully."
                        });
                     }else{
                        res.status(400).json({
                            success: false,
                            error: true,
                            message: response[1]
                        });
                     }
                }else{
                    res.status(404).json({
                        success: false,
                        error: true,
                        message: "Reference number not found."
                    });
                }
            }else{
                res.status(404).json({
                    success: false,
                    error: true,
                    message: "Email not found."
                });
            }
        }catch(e){
            if(e){
                res.status(500).json({
                    success: false,
                    error: true,
                    message: e?.response?.message || e?.message || 'Something wrong has happened'
                });
            }
        }
    }else{
        res.status(422).json({ success: false, error: true, message: errors.array() });
    }
};

module.exports.SaveSocialAIContent = async(req,res) => {
  const { media_url, caption, category } = req.body;
  const errors = validationResult(req);
  let redisClient = null;	
  if(!errors.isEmpty()){
     return  res.status(422).json({ success: false, error: true, message: errors.array() });	   
  }
  try{
      const payload = {
         user_id: 0,
         email: SYSTEM_USER_EMAIL,
         reference_number: SYSTEM_USER_REFERENCE_NUMBER,
         username: 'projectw',
         //profile_image_url: userDetail.profile_picture_url,		   
         media_url: media_url,
         caption,
	 category,		   
	 post_type: 'social-ai-board',
         is_buy_enabled: 0,
	 is_comment_allowed: 1,	   
         is_minted_automatically: 0,		   
      };
      const response = await saveSocialPost(payload);
      if(!response[0]){
         res.status(400).json({
             success: false,
             error: true,
             message: response[1]
         });
         return;
      }
	
      redisClient = await connectToRedis();
      await invalidatePostCache(redisClient,response[1]?.post_id);
      await invalidateUserCache(redisClient,email,reference_number);
	  
      res.status(200).json({
          success: true,
          error: false,
          message: "Content posted successfully."
      });
  }catch(e){
     if(e){
        res.status(500).json({
            success: false,
            error: true,
            message: e?.response?.message || e?.message || 'Something wrong has happened'
        });
     }
  }finally{
     if(redisClient) {
        await closeRedisConnection(redisClient);
     }
  } 	
};

module.exports.SaveShowOpenBidContent = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number, media_url, caption, item_amount, gps_coordinates, share_on_social_wall } = req.body;
  const file = req.file ? req.file : null;	
  let redisClient = null;	
  if(!errors.isEmpty()){
     return  res.status(422).json({ success: false, error: true, message: errors.array() }); 	  
  }
  try{
      const email_found = await findUserCountByEmail(email);
      if(email_found === 0){
         res.status(404).json({
             success: false,
             error: true,
             message: "Email not found."
         });
         return;
      }
      const reference_number_found = await findUserCountByReferenceNumber(reference_number);
      if(reference_number_found === 0){
         res.status(404).json({
             success: false,
             error: true,
             message: "Reference number not found."
         });
         return;
      }
      const userDetail = await getUserDetailByReferenceNumber(reference_number);
      let image_url;
      if(file){
         image_url = await uploadImageToCustomStorage(file?.filename);
      }else{
         image_url = null;
      }			
      const payload = {
         user_id: userDetail._id,
         email,
         reference_number,
         username: userDetail.display_name,
         profile_image_url: userDetail.profile_picture_url,			     
         media_url: image_url || media_url,
         caption,
         item_amount,
	 gps_coordinates,     
         post_type: share_on_social_wall === 0 ? 'show-board' : 'cross-board',
      };
      const response = await saveShowOpenBidPost(payload);
      if(!response[0]){
         res.status(400).json({
             success: false,
             error: true,
             message: response[1]
         });
         return;
      }

      redisClient = await connectToRedis();
      await invalidatePostCache(redisClient,response[1]?.post_id);
      await invalidateUserCache(redisClient,email,reference_number);
	  
      res.status(200).json({
          success: true,
          error: false,
          message: "Content posted successfully."
      });	  
  }catch(e){
      if(e){
         res.status(500).json({
             success: false,
             error: true,
             message: e?.response?.message || e?.message || 'Something wrong has happened'
         });
      }
  }finally{
     if(redisClient) {
        await closeRedisConnection(redisClient);
     }
  }
};

module.exports.SaveShowClosedBidContent = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number, media_url, caption, item_amount, gps_coordinates, share_on_social_wall, close_time } = req.body;
  const file = req.file ? req.file : null;	
  let redisClient = null;	
  if(!errors.isEmpty()){
     res.status(422).json({ success: false, error: true, message: errors.array() });	  
     return;	  
  }
  try{
     const email_found = await findUserCountByEmail(email);
     if(email_found === 0){
        res.status(404).json({
            success: false,
            error: true,
            message: "Email not found."
        });
        return;	     
     }
     const reference_number_found = await findUserCountByReferenceNumber(reference_number);
     if(reference_number_found === 0){
        res.status(404).json({
            success: false,
            error: true,
            message: "Reference number not found."
        });	     
	return;     
     }
     const userDetail = await getUserDetailByReferenceNumber(reference_number);
     if(file){
        image_url = await uploadImageToCustomStorage(file?.filename);
     }else{
        image_url = null;
     }
     const bidCloseTime = await addTimeToCurrentDate(close_time);
     if(bidCloseTime[0]){	
        const payload = {
           user_id: userDetail._id,
           email,
           reference_number,
           username: userDetail.display_name,
           profile_image_url: userDetail.profile_picture_url,		
           media_url: image_url || media_url,
           caption,
           item_amount,    
           gps_coordinates,     
           post_type: share_on_social_wall === 0 ? 'show-board' : 'cross-board',
	   closed_time: new Date(bidCloseTime[1]),     
        };

        const response = await saveShowClosedBidPost(payload);
        if(!response[0]){
           res.status(400).json({
               success: false,
               error: true,
               message: response[1]
           });
           return;		
	}

        redisClient = await connectToRedis();
        await invalidatePostCache(redisClient,response[1]?.post_id);
        await invalidateUserCache(redisClient,email,reference_number);
		
        res.status(200).json({
            success: true,
            error: false,
            message: "Content posted successfully."
        });
     }else{
        res.status(400).json({
            success: false,
            error: true,
            message: bidCloseTime[1]
        });			     
     }
  }catch(e){
      if(e){
         res.status(500).json({
             success: false,
             error: true,
             message: e?.response?.message || e?.message || 'Something wrong has happened'
         });
      }
  }finally{
     if(redisClient) {
        await closeRedisConnection(redisClient);
     }
  }
};

module.exports.DeleteSocialPost = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number } = req.body;
  const { post_id } = req.params;	
  const file = req.file ? req.file : null;
  let redisClient = null;	
  if(!errors.isEmpty()){
     res.status(422).json({ success: false, error: true, message: errors.array() });
     return;	  
  }
  try{
     const email_found = await findUserCountByEmail(email);
     if(email === 0){
        res.status(404).json({
            success: false,
            error: true,
            message: "Email not found."
        });
	return;     
     }	  
     const reference_number_found = await findUserCountByReferenceNumber(reference_number);
     if(reference_number_found === 0){
         res.status(404).json({
             success: false,
             error: true,
             message: "Reference number not found."
         });
	 return;    
     }	
     const response = await removeSocialPost({ post_id, reference_number });
     if(!response[0]){
         res.status(400).json({
             success: false,
             error: true,
             message: response[1]
         });
         return;
     }
     redisClient = await connectToRedis();
     await invalidatePostCache(redisClient,post_id);
     await invalidateUserCache(redisClient,email,reference_number);	  
     res.status(200).json({ success: true, error: false, message: response[1] });
  }catch(e){
     if(e){
        res.status(500).json({
            success: false,
            error: true,
            message: e?.response?.message || e?.response?.data || e?.message || 'Something wrong has happened'
        });
     }
  }finally{
     if(redisClient) {
        await closeRedisConnection(redisClient);
     }
  }  
};

module.exports.GetReportedSocialPost = async(req,res) => {
  const errors = validationResult(req);
  const { page, limit } = req.query;
  if(!errors.isEmpty()){
     return res.status(422).json({ success: false, error: true, message: errors.array() });
  }
  try{
     const response = await getReportedPosts(page, limit);   
     if(!response[0]){
         res.status(400).json({
             success: false,
             error: true,
             message: response[2]
         });
         return;
     }	  
     res.status(200).json({
         success: true,
         error: false,
         data: response[1].data,
         pagination: response[1].pagination,
         message: response[2]
     });	  
  }catch(e){
     if(e){
        res.status(500).json({
            success: false,
            error: true,
            message: e?.response?.message || e?.message || 'Something wrong has happened'
        });
     }
  }
};
