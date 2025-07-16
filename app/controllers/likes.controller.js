const { validationResult } = require("express-validator");
const { findUserCountByEmail } = require("./user/find.user.count.by.email");
const { findUserCountByReferenceNumber } = require("./user/find.user.count.by.reference.no");
const { getUserDetailByReferenceNumber } = require("./user/get.user.details");
const { addLike } = require("./user/like/add.like");
const { removeLike } = require("./user/like/remove.like");
const { likeExist } = require("./user/like/like.exist");
const { getLikeId } = require("./user/like/get.like.id");
const { getLikeCount } = require("./user/like/get.like.count");
const { getUserLikes } = require("./user/like/get.user.likes");
const { getPostCountById } = require("./user/wall/post.exist");
const { likeIdExist } = require("./user/wall/like.exist");
const { getPostByLikeId } = require("./user/like/get.post.by.like.id");
const { connectToRedis, closeRedisConnection, invalidateUserCache, invalidatePostCache } = require("../cache/redis");

module.exports.AddLike = async(req,res) => {
  let redisClient = null;	
  const errors = validationResult(req);
  const { email, reference_number, post_id } = req.body;
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
     if(!post_id || post_id === ':post_id'){
        res.status(400).json({
            success: false,
            error: true,
            message: "Missing: post_id & must be checked."
        });
        return;
     }	 
     const post_found = await getPostCountById(post_id);
     if(post_found === 0){
        res.status(404).json({
            success: false,
            error: true,
            message: `Post with id ${post_id} not found.`
        });
        return;
     }	  
     const payload = {
	 user_id: userDetail._id,    
	 email,
	 reference_number,
	 post_id    
     };
     const hasLike = await likeExist(payload);	
     if(hasLike[0] && hasLike[1] === 0){	
	const response = await addLike(payload);
	if(response[0]){	
	   redisClient = await connectToRedis();
	   await invalidatePostCache(redisClient,post_id);	
           await invalidateUserCache(redisClient,email,reference_number);		
           res.status(200).json({
               success: true,
               error: false,
               data: response[1],	
               message: "Like added successfully."
           });
        }else{
           res.status(400).json({
               success: false,
               error: true,
               message: response[1]
           });
        }
     }else{
        res.status(400).json({
            success: false,
            error: true,
            message: "No allowed. You already have posted a like."
        });
     }
  }catch(e){
      if(e){
         res.status(500).json({
             success: false,
             error: true,
             message: e?.response?.message || e?.response?.data || e?.message || 'Something wrong has happened'
         });
      }
  }finally{
      if(redisClient){
         await closeRedisConnection(redisClient);
      }
  }	
};

module.exports.RemoveLike = async(req,res) => {
  let redisClient = null;	
  const errors = validationResult(req);
  const { email, reference_number } = req.body;
  const { post_id } = req.params;
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
     if(!post_id || post_id === ':post_id'){
        res.status(400).json({
            success: false,
            error: true,
            message: "Missing: post_id & must be checked."
        });
        return;        
     }

     const post_found = await getPostCountById(post_id);
     if(post_found === 0){
        res.status(404).json({
            success: false,
            error: true,
            message: `Post with id ${post_id} not found.`
        });
        return;
     }
	  
     const respLike = await getLikeId(email,reference_number,post_id);
     if(!respLike[0]){
        res.status(404).json({
            success: false,
            error: true,
            message: "like_id not found."
        });
        return;
     }

     const payload = {
        email,
        reference_number,
        like_id: respLike[1]
     };

     const response = await removeLike(payload);
     if(!response[0]){
        res.status(404).json({
            success: false,
            error: true,
            message: response[1]
        });
	return;     
     }	
	  
     redisClient = await connectToRedis();
     await invalidatePostCache(redisClient,post_id);
     await invalidateUserCache(redisClient,email,reference_number);     
     
     res.status(200).json({
         success: true,
         error: false,
         message: response[1]
     });
  }catch(e){
      if(e){
         res.status(500).json({
             success: false,
             error: true,
             message: e?.response?.message || e?.response?.data || e?.message || 'Something wrong has happened'
         });
      }
  }finally{
      if(redisClient){
         await closeRedisConnection(redisClient);
      }
  }
};

module.exports.GetLikeCount = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number, post_id } = req.query;
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
     if(!post_id || post_id === ':post_id'){
        res.status(400).json({
            success: false,
            error: true,
            message: "Missing: post_id & must be checked."
        });
        return;
     }	  
     const response = await getLikeCount(post_id);
     if(response[0]){
        res.status(200).json({
            success: true,
            error: false,
            count: response[1],
            message: response[2]
        });
     }else{
        res.status(404).json({
            success: false,
            error: true,
            count: response[1],
            message: response[2]
        });
     }
  }catch(e){
     if(e){
        res.status(500).json({
            success: false,
            error: true,
            message: e?.response?.message || e?.response?.data || e?.message || 'Something wrong has happened'
        });
     }
  }
};

module.exports.GetUserLikes = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number, post_id } = req.query;
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
     if(!post_id || post_id === ':post_id'){
        res.status(400).json({
            success: false,
            error: true,
            message: "Missing: post_id & must be checked."
        });
        return;
     }

     const respLike = await getLikeId(email,reference_number,post_id);	  
     const response = await getUserLikes(email,reference_number);

     if(response[0]){
	const likeIdsCSV = response[1].map(item => item.like_id).join(',');     
        res.status(200).json({
            success: true,
            error: false,
	    like_id: respLike[1],	
            like_ids: likeIdsCSV,
            message: response[2]
        });
     }else{
        res.status(404).json({
            success: false,
            error: true,
            message: response[2]
        });
     }
  }catch(e){
     if(e){
        res.status(500).json({
            success: false,
            error: true,
            message: e?.response?.message || e?.response?.data || e?.message || 'Something wrong has happened'
        });
     }
  }
};
