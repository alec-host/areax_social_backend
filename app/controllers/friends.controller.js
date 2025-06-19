const { validationResult } = require("express-validator");
const { findUserCountByEmail } = require("./user/find.user.count.by.email");
const { findUserCountByReferenceNumber } = require("./user/find.user.count.by.reference.no");
const { getUserDetailByReferenceNumber } = require("./user/get.user.details");
//const { getPotentialFriends } = require("./user/friend/potential.friend");
const { getMyFriendListByReferenceNumber } = require("./user/friend/my.friend");
const { acceptFriend,blockFriend,unblockFriend } = require("./user/friend/update.friend.status"); 
const { makeFriendRequest } = require("./user/friend/request.friend");
const { queueFriendRequest } = require("./user/friend/queue.friend.request");
const { deleteFriendRequest } = require("./user/friend/purge.friend.request");
const { getUserProfilePrivacyStatus } = require("./user/get.user.profile.privacy.status");
const { getUserEmailByReferenceNumber } = require("./user/get.user.email.by.reference.no");
const { getFriendRequestByReferenceNumber } = require("./user/friend/get.friend.request.by.reference.no");
const { filterJsonAttributes,filterJsonArrayAttributes } = require("../utils/filter.json.attributes");
const { updateSingleFriendDetailsCache } = require("../sync-cache-service/sync.service");
const { USER_PROFILE_ATTRIBUTE_FILTER } = require("../constants/app_constants");
const { connectToRedis, closeRedisConnection, setCache, getCache, scanWildcardKeysPaginated } = require("../cache/redis");

module.exports.GetPotentialFriendList = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number, page } = req.query;
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
     const client = await connectToRedis();
     const users = await scanWildcardKeysPaginated(client,"user:*");
     const excludedKeys = USER_PROFILE_ATTRIBUTE_FILTER;	
     const filteredProfileData = filterJsonArrayAttributes(users,excludedKeys);	
     res.status(200).json({ success: true, error: false, data: filteredProfileData, message: 'Matched friend list.' });
     await closeRedisConnection(client);
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

module.exports.MyFriendList = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number, friend_category } = req.query;
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
     const client = await connectToRedis();
     const cachedFriendList = await client.get(`myfriend:${email}`);
     if(cachedFriendList){
        res.status(200).json({
            success: true,
            error: false,
            data: JSON.parse(cachedFriendList),
            message: "Friend list."
        });
        return;
     }
     await getMyFriendListByReferenceNumber(reference_number,friend_category, async callBack => {	
        if(callBack){  
           await updateSingleFriendDetailsCache(email);    
           res.status(200).json({
               success: true,
               error: false,
               data: callBack,
               message: "Friend list."
           });
        }else{
           res.status(404).json({
               success: false,
               error: true,
               data: [],
               message: "Friend list is not available at the moment."
           });
        }
     });
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

module.exports.GetFriendRequest = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number } = req.query;
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
     const response = await getFriendRequestByReferenceNumber(reference_number);
     if(response[0]){
        res.status(200).json({
            success: true,
            error: false,
	    data: response[1],	
            message: "Friend request."
        });                        
     }else{
        res.status(404).json({
            success: false,
            error: true,
            message: response[1]
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

module.exports.MakeFriendRequest = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number, friend_reference_number } = req.body;
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
     const userDetails = await getUserDetailByReferenceNumber(reference_number);
     const userFriendDetails = await getUserDetailByReferenceNumber(friend_reference_number);	
     const friendRequest = {
        user_id: userDetails._id,
	email: email,
	reference_number: reference_number,
	friend_id: userFriendDetails._id,  
	friend_name: userFriendDetails.display_name,
	friend_reference_number: friend_reference_number,
	friend_caption: userFriendDetails.caption,    
	friend_profile_picture_url: userFriendDetails.profile_picture_url ? userFriendDetails.profile_picture_url : null, 		    
     };		
     const response = await makeFriendRequest(friendRequest);	
     if(response[0]){			    
	const queueRequest = { 
	   reference_number: friend_reference_number,
	   originator_reference_number: reference_number,
	   originator_name: userDetails.display_name,
	   originator_caption: userDetails.caption,
	   originator_profile_picture_url: userDetails.profile_picture_url 
	};    
	//-.queue friend request.    
	await queueFriendRequest(queueRequest);   
	//-.sychronize the cache.    
	await updateSingleFriendDetailsCache(email);    
        res.status(200).json({
            success: true,
            error: false,
            //data: response[1],
            message: 'Friend request has been made.'	
        });
     }else{
        res.status(400).json({
            success: false,
            error: true,
            message: response[1]
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

module.exports.AcceptFriend = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number, originator_reference_number } = req.body;
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
     const payload = { status:'accepted',reference_number:originator_reference_number,friend_reference_number:reference_number };	
     const response = await acceptFriend(payload);		
     if(response[0]){
        //-.delete friend request.
        const response = await deleteFriendRequest(reference_number,originator_reference_number);
	console.log(response[1]);    
        res.status(200).json({
            success: true,
            error: false,
            message: response[1]
        });
     }else{
        res.status(404).json({
            success: false,
            error: true,
            message: response[1]
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

module.exports.BlockFriend = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number,friend_reference_number } = req.body;
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
     const payload = { status:'blocked',reference_number,friend_reference_number };	
     const response = await blockFriend(payload);
     if(response[0]){
        await updateSingleFriendDetailsCache(email);    
        res.status(200).json({
            success: true,
            error: false,
             message: response[1]
        });
     }else{
        res.status(404).json({
            success: false,
            error: true,
            message: response[1]
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

module.exports.UnblockFriend = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number,friend_reference_number } = req.body;
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
     const payload = { status:'accepted',reference_number,friend_reference_number };	
     const response = await unblockFriend(payload);
     if(response[0]){
        await updateSingleFriendDetailsCache(email);    
        res.status(200).json({
            success: true,
            error: false,
            message: response[1]
        });
     }else{
        res.status(404).json({
            success: false,
            error: true,
            message: response[1]
        });		
     }
  }catch(e){
     if(e){
        res.status(500).json({
            success: false,
            error: true,
            message: e?.response?.message || e?.message || e?.response?.data || 'Something wrong has happened'
        });
     }
  }
};

module.exports.ViewTargetProfile = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number,target_reference_number } = req.query;
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
     const target_found = await findUserCountByReferenceNumber(target_reference_number);
     if(target_found === 0){
        return res.status(404).json({ success: false, error: true, message: "User not found." });
     }	
     const response = await getUserProfilePrivacyStatus(target_reference_number);	
     if(response.privacy_status === "anonymous"){
        return res.status(403).json({ success: false, error: true, message: "This user has choosen to be anonymous." });    
     }else if(response.privacy_status === "friend_only"){
        return res.status(403).json({ success: false, error: true, message: "This profile is visible to friends only." });	    
     }else{
        const client = await connectToRedis();
	const target_email = await getUserEmailByReferenceNumber(target_reference_number);
	const key = `user:${target_email}`;    
	const user = await getCache(client,key); 
        const excludedKeys = USER_PROFILE_ATTRIBUTE_FILTER;
        const filteredProfileData = filterJsonAttributes(user,excludedKeys);			    
	await closeRedisConnection(client);    
        res.status(200).json({
            success: true,
            error: false,
	    data: filteredProfileData,		
            message: "User profile information."
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
