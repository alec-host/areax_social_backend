const { validationResult } = require("express-validator");
const { findUserCountByEmail } = require("./user/find.user.count.by.email");
const { findUserCountByReferenceNumber } = require("./user/find.user.count.by.reference.no");
const { getUserDetailByReferenceNumber } = require("./user/get.user.details");
//const { getPotentialFriends } = require("./user/friend/potential.friend");
const { getMyFriendListByReferenceNumber, getMyInnerCircleByReferenceNumber } = require("./user/friend/my.friend");
const { acceptFriend,blockFriend,unblockFriend,makeUserAsInnerCircle,resetUserAsInnerCircle,getInnerCircleTag } = require("./user/friend/update.friend.status"); 
const { makeConnectionRequest } = require("./user/friend/request.friend");
const { queueConnectionRequest } = require("./user/friend/queue.friend.request");
const { deleteConnectionRequest } = require("./user/friend/purge.friend.request");
const { deleteInitatorRequest } = require("./user/friend/purge.initiator.connection.request"); 
const { getUserProfileByEmail } = require("./user/get.user.profile");
const { getUserProfilePrivacyStatus } = require("./user/get.user.profile.privacy.status");
const { getUserEmailByReferenceNumber } = require("./user/get.user.email.by.reference.no");
const { getFriendRequestByReferenceNumber, getConnectionRequestorReferenceNumber } = require("./user/friend/get.friend.request.by.reference.no");
const { filterJsonAttributes,filterJsonArrayAttributes,filterUserAttributes } = require("../utils/filter.json.attributes");
const { updateSingleFriendDetailsCache,updateSingleFriendInnerCircleDetailsCache } = require("../sync-cache-service/sync.service");
const { getConnectionFollowList } = require("./user/friend/follow");
const { getConnectionFollowingList } = require("./user/friend/following");
const { sendInAppNotification } = require("../services/IN-APP-NOTIFICATION");
const { USER_PROFILE_ATTRIBUTE_FILTER } = require("../constants/app_constants");
const { connectToRedis, closeRedisConnection, setCache, getCache, deleteCache, scanWildcardKeysPaginated } = require("../cache/redis");

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
     const key = "user:*";
     const users = await scanWildcardKeysPaginated(client,key);	  
     const excludedKeys = USER_PROFILE_ATTRIBUTE_FILTER;
     const filteredProfileData = filterUserAttributes(users,excludedKeys);	
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
           await updateSingleFriendDetailsCache(reference_number);    
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

module.exports.GetConnectionRequest = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number,type } = req.query;
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
       
     if(type === "receiver"){
        const [ok,response] = await getFriendRequestByReferenceNumber(reference_number);
        if(!ok){
           let errorCode=404;
	   if(response !== 'No record found.') {errorCode=400;}	
           res.status(errorCode).json({
               success: false,
               error: true,
               message: response
           });
           return;
	}		
        res.status(200).json({
            success: true,
            error: false,
	    data: response,	
            message: "Sender - pending connection request[s]."
        });	
     }else{
        const [ok,response] = await getConnectionRequestorReferenceNumber(reference_number);
        if(!ok){
           let errorCode=404;		
           if(response !== 'No record found.') {errorCode=400;}		
           res.status(errorCode).json({
               success: false,
               error: true,
               message: response
           });
           return;          
        }
        res.status(200).json({
            success: true,
            error: false,
            data: response,
            message: "Receiver - pending connection request[s]."
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

module.exports.MakeConnectionRequest = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number, friend_reference_number, connection_type } = req.body;
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

     const friend_reference_number_found = await findUserCountByReferenceNumber(friend_reference_number);
     if(friend_reference_number_found === 0){
        res.status(404).json({
            success: false,
            error: true,
            message: "Friend reference number not found."
        });
        return;
     }	  

     let _connection_type=null;
     if(connection_type === "inner-circle"){
	_connection_type="Friend";     
     }else{
        _connection_type="Follow";
     }

     const userDetails = await getUserDetailByReferenceNumber(reference_number);
     const userFriendDetails = await getUserDetailByReferenceNumber(friend_reference_number);

     const privacyStatus = userFriendDetails.privacy_status;

     if(privacyStatus === 'private'){
        console.log('User profile is private.');
     }

     const MAX = 65_535;
     const friendCaption = (userFriendDetails.caption || '').slice(0, MAX);
       
     const connectionRequest = {
        user_id: userDetails._id,
	email: email,
	reference_number: reference_number,
	friend_id: userFriendDetails._id,  
	friend_name: userFriendDetails.display_name,
	friend_reference_number: friend_reference_number,
	friend_caption: friendCaption,    
	friend_profile_picture_url: userFriendDetails.profile_picture_url ? userFriendDetails.profile_picture_url : null,
	friend_category: _connection_type,
	status: privacyStatus === 'private' ? 'pending' : 'accepted',     
     };	

     const [ok,response] = await makeConnectionRequest(connectionRequest);	
     if(!ok){
        res.status(400).json({
            success: false,
            error: true,
            message: response
        });
	return;     
     }

     const originatorCaption = (userDetails.caption || '').slice(0, MAX);
     const queueRequest = { 
	reference_number: friend_reference_number,
	originator_reference_number: reference_number,
	originator_name: userDetails.display_name,
	originator_caption: originatorCaption,	
	originator_profile_picture_url: userDetails.profile_picture_url,		
     };    
    
     //-.queue friend request.    
     if(privacyStatus === 'private')
        await queueConnectionRequest(queueRequest);
     
     //-.sychronize the cache.    
     await updateSingleFriendDetailsCache(reference_number);   

     const title = privacyStatus === 'private' ? `${_connection_type} request` : `${_connection_type} connection`;
     const message = privacyStatus === 'private' ? `You have a new ${_connection_type} request.` : `You have a new ${_connection_type} connection.`;

     /**     
        const payload = {
          email: userFriendDetails.email,
          reference_number: friend_reference_number,
          title,
          message,
        };
 
	const response = axiosInstance.post("https://api.projectw.ai/fbase/api/v1/send-direct-message",payload);
     */

     const payload = {
        title: title,
        message: message,
        image_url: null,
        users: [userFriendDetails.email],
        notification_for: "2"
     };
       
     //-send a notification.
     await sendInAppNotification(payload); 

     res.status(200).json({
         success: true,
         error: false,
         message: privacyStatus === 'private' ? `${_connection_type} request has been made.` : `${_connection_type} connection has been made`	
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

module.exports.AcceptConnection = async(req,res) => {
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
     const payload = { status:'accepted',reference_number:reference_number,friend_reference_number: originator_reference_number };	
     const response = await acceptFriend(payload);		
     if(response[0]){
        //-.delete friend request.
        const response = await deleteConnectionRequest(reference_number,originator_reference_number);
	     
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

module.exports.RemoveConnection = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number, initiator_reference_number } = req.body;
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

     const initiator_reference_number_found = await findUserCountByReferenceNumber(initiator_reference_number);
     if(initiator_reference_number_found === 0){
        res.status(404).json({
            success: false,
            error: true,
            message: "Initiator reference number not found."
        });
        return;
     }	  
     
     const [ok,respInitiator] = await deleteInitatorRequest(initiator_reference_number,reference_number);
     if(!ok){
        res.status(404).json({
            success: false,
            error: true,
            message: respInitiator
        });
	return;     
     }
     //-.delete friend request.
     await deleteConnectionRequest(initiator_reference_number,reference_number);
     res.status(200).json({
         success: true,
         error: false,
         message: respInitiator
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
        await updateSingleFriendDetailsCache(reference_number);    
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
        await updateSingleFriendDetailsCache(reference_number);    
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
     if(response.privacy_status === "private" && reference_number !== target_reference_number){
        return res.status(403).json({ success: false, error: true, message: "This user has choosen to be private" });    
     }else if(response.privacy_status === "friend_only"){
        return res.status(403).json({ success: false, error: true, message: "This profile is visible to friends only." });	    
     }else{
        const client = await connectToRedis();
	const target_email = await getUserEmailByReferenceNumber(target_reference_number);
	const key = `user:${target_email}`;    
	const user = await getCache(client,key);
        const excludedKeys = USER_PROFILE_ATTRIBUTE_FILTER;
	let filteredProfileData = null;     
	if(!user){
           await getUserProfileByEmail(target_email,async userCallback => {   	   
             if(userCallback.length > 0){
		filteredProfileData = filterJsonAttributes(userCallback,excludedKeys);
             }else{
                console.log('No record found.');
             }
           });
        }else{
	  filteredProfileData = filterJsonAttributes(user,excludedKeys); 
          await deleteCache(client,key);
	}
        //await deleteCache(client,key);
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

module.exports.ConnectionFollowList = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number, target_reference_number, page, limit } = req.query;
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

     const target_reference_number_found = await findUserCountByReferenceNumber(target_reference_number);
     if(target_reference_number_found === 0){
        res.status(404).json({
            success: false,
            error: true,
            message: "Target reference number not found."
        });
        return;
     }	  
     
     const [ok, response] = await getConnectionFollowList(target_reference_number, parseInt(page), parseInt(limit));
     if(!ok){
	 if(response === 'not_found'){
            res.status(404).json({
                success: false,
                error: true,
                message: "No record found"
            });
            return;		 
	 }    
         res.status(400).json({
            success: false,
            error: true,
            message: response
        });
        return;       
     } 	  
  
     res.status(200).json({
         success: true,
         error: false,
	 data: response,    
         message: "Current connection list"
     }); 	  
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

module.exports.ConnectionFollowingList = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number, target_reference_number, page, limit } = req.query;
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

     const target_reference_number_found = await findUserCountByReferenceNumber(target_reference_number);
     if(target_reference_number_found === 0){
        res.status(404).json({
            success: false,
            error: true,
            message: "Target reference number not found."
        });
        return;
     }

     const [ok, response] = await getConnectionFollowingList(target_reference_number, parseInt(page), parseInt(limit));
     if(!ok){
         if(response === 'not_found'){
            res.status(404).json({
                success: false,
                error: true,
                message: "No record found"
            });
            return;
         }
         res.status(400).json({
            success: false,
            error: true,
            message: response
        });
        return;
     }

     res.status(200).json({
         success: true,
         error: false,
         data: response,
         message: "Current connection list"
     });
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

module.exports.SetResetInnerCircleTag = async(req,res) => {
  const errors = validationResult(req);
  const { email,reference_number } = req.body;
  const { target_reference_number,is_set } = req.params; 
 
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
    
     const payload = { 
	close_friend_tag: Number(is_set) === 1 ? 'inner-circle' : null,
	reference_number,
	friend_reference_number: target_reference_number 
     };

     const innerCircleStatus = await getInnerCircleTag(payload);	  
     
     if(Number(innerCircleStatus) === 0 && Number(is_set) === 1){
        res.status(400).json({
            success: false,
            error: true,
            message: 'User is already tagged as inner-circle, to untag set is_set to 0.'
        });
	return;     
     }

     if(Number(innerCircleStatus) === 1 && Number(is_set) === 0){
        res.status(400).json({
            success: false,
            error: true,
            message: 'User is not tagged as inner-circle, set is_set to 1'
        });
        return;
     }
	  
     const response = Number(is_set) === 1 ? await makeUserAsInnerCircle(payload) : await resetUserAsInnerCircle(payload); 
     if(response[0]){
        await updateSingleFriendDetailsCache(reference_number);
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

/*
module.exports.ResetConnectionAsInnerCircle = async(req,res) => {
  const errors = validationResult(req);
  const { email,reference_number,target_reference_number,is_set } = req.body;
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
     const payload = { close_friend_tag: null,reference_number,friend_reference_number: target_reference_number };
     const response = await resetUserAsInnerCircle(payload);
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
*/

module.exports.MyInnerCircleList = async(req,res) => {
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
     const cachedFriendList = await client.get(`myfriendInnerCircle:${email}`);
     if(cachedFriendList){
        res.status(200).json({
            success: true,
            error: false,
            data: JSON.parse(cachedFriendList),
            message: "Friend (inner-circle) list."
        });
        return;
     }
     await getMyInnerCircleByReferenceNumber(reference_number,friend_category,async callBack => {
        if(callBack){
           await updateSingleFriendInnerCircleDetailsCache(reference_number);
           res.status(200).json({
               success: true,
               error: false,
               data: callBack,
               message: "Friend (inner-circle) list."
           });
        }else{
           res.status(404).json({
               success: false,
               error: true,
               data: [],
               message: "Friend (inner-circle) list is not available at the moment."
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
