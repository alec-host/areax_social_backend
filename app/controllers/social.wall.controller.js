const { validationResult } = require("express-validator");
const { findUserCountByEmail } = require("./user/find.user.count.by.email");
const { findUserCountByReferenceNumber } = require("./user/find.user.count.by.reference.no");
const { getUserDetailByReferenceNumber } = require("./user/get.user.details");
const { getWallRecords } = require("./user/wall/get.wall");
const { getWallHashtagRecords } = require("./user/wall/get.wall.hashtag");
const { getSavedWallRecords } = require("./user/wall/get.wall.saved");
const { getGroupWallRecords } = require("./user/wall/get.group.wall");
const { getWallRecordsByReferenceNumber } = require("./user/wall/get.wall.by.reference.number");
const { saveShowPost } = require("./user/wall/post.show.content");
const { saveSocialPost } = require("./user/wall/post.social.content");
const { saveGroupPost } = require("./user/wall/post.group.content");
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
const { isGroupAdmin } = require("./user/group/is.group.admin");
const { groupByReferenceNumber } = require("./user/group/group.by.reference.no");
const { findGroupUserMemberShipCount } = require("./user/group/group.user.membership");
const { isUserMuted } = require("./user/group/group.user.is.muted");
const { getUserActivityMetrics } = require("../utils/user.post.follow.metrics");
const { filterSavedByReference } = require("../utils/filter.is.saved.post");
const { onCreateWeePointPost } = require("../services/WEE-POINT");

const { connectToRedis, closeRedisConnection, setSocialWallCache, 
	getSocialWallCache, setGroupSocialWallCache, getGroupSocialWallCache,
	setSavedSocialWallCache, getSavedSocialWallCache,
	setUserDataCache, getUserDataCache,invalidatePostCache, 
	invalidateUserCache, invalidateGroupUserCache, invalidateGroupPostCache,invalidateSavedPostCache,
        setSavedSocialWallCollectionCache,getSavedSocialWallCollectionCache,invalidateSavedPostCollectionCache } = require("../cache/redis");

const { SYSTEM_USER_EMAIL, SYSTEM_USER_REFERENCE_NUMBER } = require("../constants/app_constants");

module.exports.GetWallContent = async(req,res) => {
  let redisClient = null;	
  const errors = validationResult(req);
  const { email, reference_number, post_type, hashtag, cursor, page, limit } = req.query;
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
     
     if(cachedData && cachedData.socialPosts.length > 0 && !hashtag){ 
        return res.status(200).json({
           success: true,
           error: false,
           data: cachedData.socialPosts,
           pagination: cachedData.pagination,
	   infinite_scroll: cachedData.infinite_scroll,
           message: "List of social wall post[s] (cached)."
        });
     }

     // Try to get cached user data first
     const [cachedLikes, cachedSaved, cachedReported] = await Promise.all([
        getUserDataCache(redisClient, 'user_likes', email, reference_number),
        getUserDataCache(redisClient, 'user_saved', email, reference_number),
        getUserDataCache(redisClient, 'user_reported', email, reference_number)
     ]);	
     let mCursor=null;
     if(cursor){mCursor=cursor};	  
     // Fetch data from database
     const [postResp, likeresp, savedPostResp, reportedPostResp] = await Promise.all([
        //getWallRecords(post_type, is_public, page, limit),
	!hashtag ? getWallRecords(post_type, is_public, mCursor, page, limit) : getWallHashtagRecords(post_type, hashtag ,is_public, mCursor, page, limit),
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
        },
	infinite_scroll: {
          next_cursor: postResp[1].nextCursor,
          has_more: postResp[1].hasMore		
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
	 infinite_scroll: responseData.infinite_scroll,    
         message: !hashtag ? "List of social wall post[s]." : `List of social wall post[s] filtered using hashtag #${hashtag}.` 
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
  const { email, reference_number, post_type, group_reference_number, page, limit } = req.query;
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

     const group = await groupByReferenceNumber(group_reference_number);
     if(!group[0]){
        res.status(404).json({
            success: false,
            error: true,
            message: group[1]
        });
        return;
     }

     const is_public = 'private';
     const cachedData = await getGroupSocialWallCache(
        redisClient,
        post_type, 
        is_public,
	group_reference_number,     
        page,
        limit,
        email,
        reference_number
     );

     if(cachedData && cachedData.groupPosts.length > 0){
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
        getGroupWallRecords(post_type, group_reference_number, is_public, page, limit),
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
     await setGroupSocialWallCache(
        redisClient,
        post_type,
        is_public,
	group_reference_number,     
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

module.exports.GetSavedWallContent = async(req,res) => {
  let redisClient = null;
  const errors = validationResult(req);
  const { email, reference_number, post_type, collection_reference_number=null, hashtag, cursor, page, limit } = req.query;
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
     const cachedData = collection_reference_number ?
     await getSavedSocialWallCollectionCache(
        redisClient,
        post_type,
        is_public,
        page,
        limit,
        email,
        reference_number
     )
     :		  
     await getSavedSocialWallCache(
        redisClient,
        post_type,
        is_public,
        page,
        limit,
        email,
        reference_number
     );
	  
     if(cachedData && cachedData.data?.length > 0){
        return res.status(200).json({
           success: true,
           error: false,
           data: cachedData.data,
           pagination: cachedData.pagination,
           infinite_scroll: cachedData.infinite_scroll,
           message: "List of saved social wall post[s] (cached)."
        });
     }

     // Try to get cached user data first
     const [cachedLikes, cachedSaved, cachedReported] = await Promise.all([
        getUserDataCache(redisClient, 'user_likes', email, reference_number),
        getUserDataCache(redisClient, 'user_saved', email, reference_number),
        getUserDataCache(redisClient, 'user_reported', email, reference_number)
     ]);

     let mCursor=null;
     if(cursor){mCursor=cursor};
     // Fetch data from database
     const [postResp, likeresp, savedPostResp, reportedPostResp] = await Promise.all([
        getSavedWallRecords(post_type, reference_number, hashtag, collection_reference_number, is_public, mCursor, page, limit),
        //!hashtag ? getWallRecords(post_type, is_public, mCursor, page, limit) : getWallHashtagRecords(post_type, hashtag ,is_public, mCursor, page, limit),
        cachedLikes ? Promise.resolve([true, cachedLikes]) : getUserLikes(email, reference_number),
        cachedSaved ? Promise.resolve([true, cachedSaved]) : getUserSavedPosts(email, reference_number),
        cachedReported ? Promise.resolve([true, cachedReported]) : getUserReportedPosts(email, reference_number)
     ]);

     if(!postResp[0]) {
        return res.status(400).json({
           success: false,
           error: true,
           message: "Error: fetching saved social wall post[s]."
        });
     }

     const savedSocialPosts = await likedSavedReportedPost(
        postResp[1].data,
        likeresp[1],
        savedPostResp[1],
        reportedPostResp[1]
     );
     
     const filteredSavedSocialPosts = filterSavedByReference(savedSocialPosts,reference_number,parseInt(postResp[1].currentPage));	  
     
     const responseData = {
	savedSocialPosts: filteredSavedSocialPosts,
     };
     
     if(responseData && responseData.savedSocialPosts.data?.length === 0){
        return res.status(404).json({
           success: false,
           error: true,
           message: "No saved social wall post."
        });
     }

     // Cache the response
     collection_reference_number ?
     await setSavedSocialWallCollectionCache(
        redisClient,
        post_type,
        is_public,
        page,
        limit,
        email,
        reference_number,
        responseData.savedSocialPosts
     )
     :	  
     await setSavedSocialWallCache(
        redisClient,
        post_type,
        is_public,
        page,
        limit,
        email,
        reference_number,
        responseData.savedSocialPosts
     );
      //setSavedSocialWallCache = async (client, postType, isPublic, page, limit, email, referenceNumber, data) 	  

     // Cache user-specific data
     await Promise.all([
        setUserDataCache(redisClient, 'user_likes', email, reference_number, likeresp[1]),
        setUserDataCache(redisClient, 'user_saved', email, reference_number, savedPostResp[1]),
        setUserDataCache(redisClient, 'user_reported', email, reference_number, reportedPostResp[1])
     ]);	  
	  
     res.status(200).json({
         success: true,
         error: false,
         data: responseData.savedSocialPosts.data,
         pagination: responseData.savedSocialPosts.pagination,
         infinite_scroll: responseData.savedSocialPosts.infinite_scroll,
         message: !hashtag ? "List of saved social wall post[s]." : `List of social wall post[s] filtered using hashtag #${hashtag}.`
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
  const { email, reference_number, target_reference_number, post_type } = req.query;
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

      const target_reference_number_found = await findUserCountByReferenceNumber(target_reference_number);
      if(target_reference_number_found === 0){
         res.status(404).json({
             success: false,
             error: true,
             message: "Target reference number not found."
         });
         return;
      }
	  
     const response = await getWallRecordsByReferenceNumber(target_reference_number,post_type);	
     if(!response[0]){
        res.status(400).json({
            success: false,
            error: true,
            message: "Error: fetching my social wall post[s]."
        });
	return;     
     }
     
     if(response[1] && response[1]?.data.length === 0){
        res.status(404).json({
            success: false,
            error: true,
            message: "No social wall post[s]."
        });
	return;
     }
     res.status(200).json({
         success: true,
         error: false,
	 data: response[1]?.data,	
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
   }
};

module.exports.SaveShowContent = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number, media_url, caption, item_amount, gps_coordinates, location_name, share_on_social_wall, is_buy_enabled, is_comment_allowed, is_minted_automatically } = req.body;
  const file = req.file || null;	
  let mimeType = null;	
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
	 mimeType = file?.mimetype;     
      }else{
	 image_url = null;
	 mimeType = null;     
      }

      let social_content_type = 'other';
      if(mimeType?.startsWith('image/')) {
         social_content_type='image';
      }else if (mimeType?.startsWith('video/')) {
         social_content_type='video';
      }	  

      const payload = {
         user_id: userDetail._id,
         email,
         reference_number,
         username: userDetail.display_name,
         profile_image_url: userDetail.profile_picture_url,			     
         media_url: image_url || media_url,
	 type: social_content_type,     
         caption,
         item_amount,
         gps_coordinates,
         location_name: location_name && location_name.trim().length > 0 ? location_name.trim() : null,   
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
  const { email, reference_number, media_url, gps_coordinates, caption, location_name, is_buy_enabled, is_public, is_comment_allowed, is_minted_automatically } = req.body;
  const file = req.file || null;
  let mimeType;
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
	 mimeType = file?.mimetype;     
      }else{
         image_url = null;
	 mimeType = null; 
      }

      let social_content_type = 'other';
      if(mimeType?.startsWith('image/')) {
         social_content_type='image';
      }else if (mimeType?.startsWith('video/')) {
         social_content_type='video';
      }

      const payload = { 
	 user_id: userDetail._id,
	 email,
	 reference_number,
         username: userDetail.display_name,
	 profile_image_url: userDetail.profile_picture_url,     
	 media_url: image_url || media_url,
	 type: social_content_type,     
	 caption,
	 location_name: location_name && location_name.trim().length > 0 ? location_name.trim() : null,     
	 gps_coordinates,     
	 post_type: 'social-board',
	 is_public: is_public,      
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
      await invalidateSavedPostCache(redisClient,response[1]?.post_id);	 
      await invalidateSavedPostCollectionCache(redisClient,response[1]?.post_id);	  
      //-.reward: wee-point	  
      await onCreateWeePointPost(email,'social_post');

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
  const { email, reference_number, group_reference_number, media_url, gps_coordinates, caption, is_public, location_name, is_buy_enabled, is_comment_allowed, is_minted_automatically } = req.body;
  const file = req.file || null;
  let mimeType = null;	
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

      const [ok, groupResp] = await isUserMuted(group_reference_number,reference_number);
      if(!ok){
         res.status(403).json({
             success: false,
             error: true,
             message: groupResp
         });
         return;
      }

      const userDetail = await getUserDetailByReferenceNumber(reference_number);

      let image_url;
      if(file){
         image_url = await uploadImageToCustomStorage(file?.filename);
	 mimeType = file?.mimetype;     
      }else{
         image_url = null;
	 mimeType = null;     
      }

      let social_content_type = 'other';
      if(mimeType?.startsWith('image/')) {
         social_content_type='image';
      }else if (mimeType?.startsWith('video/')) {
         social_content_type='video';
      }
	  
      const payload = {
         user_id: userDetail._id,
         email,
         reference_number,
         username: userDetail.display_name,
         profile_image_url: userDetail.profile_picture_url,
	 group_reference_number,     
         media_url: image_url || media_url,
	 type: social_content_type,     
         caption,
         location_name: location_name && location_name.trim().length > 0 ? location_name.trim() : null,
         gps_coordinates,
         post_type: 'group-board',
	 is_public: is_public,     
         is_buy_enabled: is_buy_enabled,
         is_comment_allowed: is_comment_allowed,
         is_minted_automatically: is_minted_automatically
      };

      const response = await saveGroupPost(payload);
      if(!response[0]){
         res.status(400).json({
             success: false,
             error: true,
             message: response[1]
         });
         return;
      }

      redisClient = await connectToRedis();
      await invalidateGroupPostCache(redisClient,response[1]?.post_id);	  
      await invalidatePostCache(redisClient,response[1]?.post_id);
      await invalidateUserCache(redisClient,email,reference_number);
      await invalidateGroupUserCache(redisClient,email,reference_number);
      res.status(200).json({
          success: true,
          error: false,
          message: "Group content has been posted."
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
    let mimeType = null;	
    const file = req.file || null;	
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
			 mimeType = file?.mimetype;    
                     }else{
                         image_url = null;
                     }	

                     let social_content_type = 'other';
                     if(mimeType.startsWith('image/')) {
                        social_content_type='image';
                     }else if (mimeType.startsWith('video/')) {
                        social_content_type='video';
                     }

                     const payload = {
                        user_id: userDetail._id,
                        email,
                        reference_number,
                        media_url: image_url || media_url,
			type: social_content_type,     
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
  const file = req.file || null;	
  let mimeType = null;	
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
	 mimeType = file?.mimetype;     
      }else{
         image_url = null;
      }	

      let social_content_type = 'other';
      if(mimeType.startsWith('image/')) {
         social_content_type='image';
      }else if (mimeType.startsWith('video/')) {
         social_content_type='video';
      }	  

      const payload = {
         user_id: userDetail._id,
         email,
         reference_number,
         username: userDetail.display_name,
         profile_image_url: userDetail.profile_picture_url,			     
         media_url: image_url || media_url,
	 type: social_content_type,     
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
  const file = req.file || null;	
  let mimeType = null;	
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
	mimeType = file?.mimetype;     
     }else{
        image_url = null;
     }

     let social_content_type = 'other';
     if(mimeType.startsWith('image/')) {
        social_content_type='image';
     }else if (mimeType.startsWith('video/')) {
        social_content_type='video';
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
           type: social_content_type,		
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
  const file = req.file || null;
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
     const response = await getReportedPosts(null,page,limit);   
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

module.exports.GetReportedGroupPost = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number, group_reference_number, page, limit } = req.query;
  if(!errors.isEmpty()){
     return res.status(422).json({ success: false, error: true, message: errors.array() });
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
	  
     const group = await groupByReferenceNumber(group_reference_number);
     if(!group[0]){
        res.status(404).json({
            success: false,
            error: true,
            message: group[1]
        });
        return;
     }	 

     const admin = await isGroupAdmin(reference_number);
     if(!admin[0]){
        res.status(403).json({
            success: false,
            error: true,
            message: "Unauthorized"
        });
        return;
     }

     const response = await getReportedPosts(group_reference_number,page,limit);
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

module.exports.SocialProfileMetrics = async(req,res) => {
  const { email, reference_number, target_reference_number } = req.query;
  const errors = validationResult(req);
  let redisClient = null;
  if(!errors.isEmpty()){
     return  res.status(422).json({ success: false, error: true, message: errors.array() });
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
	 
      const target_reference_number_found = await findUserCountByReferenceNumber(target_reference_number);
      if(target_reference_number_found === 0){
         res.status(404).json({
             success: false,
             error: true,
             message: "Target reference number not found."
         });
         return;
      }
      
      const userDetail = await getUserDetailByReferenceNumber(target_reference_number);
      const name = userDetail?.display_name;
      const profile_status = userDetail?.privacy_status;	  
      const stats = await getUserActivityMetrics(reference_number,target_reference_number,name,profile_status);
      
      res.status(200).json({
          success: true,
          error: false,
	  data: stats,    
          message: "Profile metrics & other status."
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

