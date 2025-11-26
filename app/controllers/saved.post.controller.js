const { v4: uuidv4 } = require('uuid');
const { validationResult } = require("express-validator");

const { savePost } = require("./user/saved/saved.post");
const { createCollection } = require("./user/saved/create.collection");
const { savePostToCollection } = require("./user/saved/add.post.collection");
const { addCollectionInvite } = require("./user/saved/add.user.collection");
const { savedPostExist } = require("./user/saved/saved.post.exist");
const { removeSavedPost } = require("./user/saved/remove.saved.post");
const { getPostCountById } = require("./user/wall/post.exist");
const { getUserSavedPosts } = require("./user/saved/get.user.saved.post");
const { getCollectionInviteList } = require("./user/saved/get.collection.invite");
const { getCollectionList } = require("./user/saved/get.collection");
const { findUserCountByEmail } = require("./user/find.user.count.by.email");
const { findUserCountByReferenceNumber } = require("./user/find.user.count.by.reference.no");
const { getUserDetailByReferenceNumber } = require("./user/get.user.details");
const { acceptRejectInvite,getCollectionInviteStatus } = require("./user/saved/accept.reject.collection");
const { sendInAppNotification } = require("../services/IN-APP-NOTIFICATION");
const { removeValueAndSize } = require("../utils/array.remove.value");
const { preSaveToCollectionVerification } = require("./user/saved/get.collection.count.by.reference_number");
const { getCollectionAccessStatus } = require("./user/saved/get.collection.access.status.js");
const { connectToRedis, closeRedisConnection, invalidateUserCache, invalidatePostCache,invalidateSavedPostCache,invalidateSavedPostCollectionCache } = require("../cache/redis");

class SavedPostController {
   async addSavedPost(req,res){
      let redisClient = null;	   
      const errors = validationResult(req);	   
      const { email, reference_number, post_id } = req.body;
      try{	   
         if(!errors.isEmpty()){
            res.status(422).json({ success: false, error: true, message: errors.array() });		 
            return;
         }
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

         const post_found = await getPostCountById(post_id);
         if(post_found === 0){
            res.status(404).json({
                success: false,
                error: true,
                message: `Post with id ${post_id} not found.`
            });
            return;
         }
	 
	 const save_post_found = await savedPostExist({ reference_number,post_id });     
	 if(save_post_found[0] && save_post_found[1] > 0){
            res.status(400).json({
                success: false,
                error: true,
                message: `Post with post_id ${post_id} exist.`
            });
            return;
	 }     

	 const userDetail = await getUserDetailByReferenceNumber(reference_number);  

	 const response = await savePost({ user_id:userDetail._id,email,reference_number,post_id });     
	 if(response[0]){
            redisClient = await connectToRedis();
            await invalidateUserCache(redisClient,email,reference_number);
	    await invalidateSavedPostCache(redisClient,post_id);	
            await invalidateSavedPostCollectionCache(redisClient,post_id);		 
            res.status(201).json({
                success: true,
                error: false, 
                message: "Post has been saved."
            }); 
	 }else{
            res.status(400).json({
                success: false,
                error: true,
                message: "Failed to save the post."
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
         if(redisClient){
            await closeRedisConnection(redisClient);
         }
      }	   
   };

   async removeSavedPost(req,res){
      let redisClient = null;	   
      const errors = validationResult(req);
      const { email, reference_number } = req.body;
      const { post_id } = req.params;	   
      try{
         if(!errors.isEmpty()){
            res.status(422).json({ success: false, error: true, message: errors.array() });
            return;
         }
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
	    
         const save_post_found = await savedPostExist({ reference_number,post_id });
         if(save_post_found[0] && save_post_found[1] === 0){
            res.status(400).json({
                success: false,
                error: true,
                message: `Post with post_id ${post_id} does not exist.`
            });
            return;
         }	      

         const response = await removeSavedPost({ email,reference_number,post_id });
         if(response[0]){
            redisClient = await connectToRedis();
            await invalidateUserCache(redisClient,email,reference_number);
            await invalidateSavedPostCache(redisClient,post_id);
	    await invalidateSavedPostCollectionCache(redisClient,post_id);	 
            res.status(200).json({
                success: true,
                error: false,
                message: "Post has been deleted."
            });
         }else{
            res.status(400).json({
                success: false,
                error: true,
                message: "Failed to delete the post."
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
         if(redisClient){
            await closeRedisConnection(redisClient);
         }
      }
   };

   async getSavedPost(req,res){
      const errors = validationResult(req);
      const { email, reference_number } = req.query;
      try{
         if(!errors.isEmpty()){
            res.status(422).json({ success: false, error: true, message: errors.array() });
            return;
         }
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

         const respSavedPost = await getUserSavedPosts(email,reference_number); 
         if(respSavedPost[0]){
	    const savedPostIdsCSV = respSavedPost[1].map(item => item.post_id).join(',');	 
            res.status(200).json({
                success: true,
                error: false,
		saved_post_ids: savedPostIdsCSV,
                message: respSavedPost[2]
            });
         }else{
            res.status(404).json({
                success: false,
                error: true,
                message: respSavedPost[2]
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

   async createCollection(req,res){
      const errors = validationResult(req);
      const { email, reference_number, /*post_id,*/ collection_name, invitee_reference_numbers, is_collection_shared } = req.body;
      try{
         if(!errors.isEmpty()){
            res.status(422).json({ success: false, error: true, message: errors.array() });
            return;
         }
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

	 let success = null;
	 let respReorganizedInvitesList = []; 
         if(is_collection_shared === 1 && invitee_reference_numbers.length > 0){
            [success,respReorganizedInvitesList] = removeValueAndSize(invitee_reference_numbers,reference_number);

            if(respReorganizedInvitesList.size === 0){
               res.status(400).json({
                   success: false,
                   error: true,
                   message: `Cannot invite self to own collection.`
               });
               return;
	    }
	 } 

	 /*     
         const post_found = await getPostCountById(post_id);
         if(post_found === 0){
            res.status(404).json({
                success: false,
                error: true,
                message: `Post with id ${post_id} not found.`
            });
            return;
         }
         */

	 const userDetail = await getUserDetailByReferenceNumber(reference_number);    

	 const collection_reference_number = `PW-COLL-${uuidv4()}`;
	 const payload = {
            name: collection_name,	 
            collection_reference_number: collection_reference_number,	 
            is_shared: is_collection_shared,
            creator_reference_number: reference_number,
            creator_name: userDetail?.display_name,
	    profile_picture_url: userDetail?.profile_picture_url,		 
	 };     

	 const [ok,response] = await createCollection(payload);     
	 if(!ok){
            res.status(400).json({
                success: false,
                error: true,
                message: response
            });		 
            return;
	 }
         
	 if(is_collection_shared === 1 && invitee_reference_numbers.length > 0){     
	    //-.invite payload.
            const payloadCollectionInvite = {
               invitee_reference_numbers: respReorganizedInvitesList.array,
               collection_reference_number
            };

            const [okInvite,responseInvite] = await addCollectionInvite(payloadCollectionInvite);
            if(!okInvite){
               res.status(400).json({
                   success: false,
                   error: true,
                   message: responseInvite
               });
               return;
            }
	 }

         res.status(201).json({
             success: true,
             error: false,
             data: response,		 
             message: `Collection with name: ${collection_name} has been created.`
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

   async getCollections(req,res){
      const errors = validationResult(req);
      const { email, reference_number } = req.query;
      try{
         if(!errors.isEmpty()){
            res.status(422).json({ success: false, error: true, message: errors.array() });
            return;
         }
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
         const [ok, response] = await getCollectionList(email,reference_number);
         if(!ok){
            res.status(404).json({
                success: false,
                error: true,
                message: 'Not found'
            });
            return;
         }
         res.status(200).json({
             success: true,
             error: false,
             data: response,
             message: 'List of collection[s].'
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

   async addPostToCollection(req,res){	
      const errors = validationResult(req);	   
      const { email, reference_number, post_id, collection_reference_number } = req.body;
      let redisClient = null;	   
      try{
         if(!errors.isEmpty()){
            res.status(422).json({ success: false, error: true, message: errors.array() });
            return;
         }
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

         const post_found = await getPostCountById(post_id);
         if(post_found === 0){
            res.status(404).json({
                success: false,
                error: true,
                message: `Post with post_id: '${post_id}' not found.`
            });
            return;
         }
 
         const [success,responseMessage] = await preSaveToCollectionVerification(post_id,collection_reference_number);
	 if(!success) {
            res.status(400).json({
                success: false,
                error: true,
                message: responseMessage
            });
	    return;
	 }

         if(responseMessage === 0){
            res.status(404).json({
                success: false,
                error: true,
                message: `Collection with collection_reference_number: '${collection_reference_number}' not found.`
            });
            return;
	 }	      

	 const [success2,responseCollection] = await getCollectionAccessStatus(email,reference_number,collection_reference_number);     
      	 if(!success2){
            res.status(401).json({
                success: false,
                error: true,
                message: responseCollection
            });
            return;
	 }else{
            const { collection_name, status, created_at } = responseCollection;		
	    if(status !== 'accepted'){
               res.status(401).json({
                   success: false,
                   error: true,
                   message: `You’re not allowed to perform this action — you must accept the collection invite first.`
              });
              return;
	    }	 
	 }     
         const payload = {
            post_id,
            collection_reference_number: collection_reference_number
         };

	 const [ok,response] = await savePostToCollection(payload);
         if(!ok){
           res.status(400).json({
               success: false,
               error: true,
               message: response
           });
           return;
         }   
         
	 const userDetail = await getUserDetailByReferenceNumber(reference_number);

         const responseSavedPost = await savePost({ user_id:userDetail._id,email,reference_number,post_id });
         if(responseSavedPost[0]){
            redisClient = await connectToRedis();
            await invalidateUserCache(redisClient,email,reference_number);
            await invalidateSavedPostCache(redisClient,post_id);
            await invalidateSavedPostCollectionCache(redisClient,post_id);
	 }
         res.status(200).json({
             success: true,
             error: false,
             message: response
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
         if(redisClient){
            await closeRedisConnection(redisClient);
         }
      }
   };

   async getCollectionInvite(req,res){
      const errors = validationResult(req);
      const { email, reference_number } = req.query;
      try{
         if(!errors.isEmpty()){
            res.status(422).json({ success: false, error: true, message: errors.array() });
            return;
         }
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
	 const [ok, response] = await getCollectionInviteList(email,reference_number);    
	 if(!ok){
            res.status(404).json({
                success: false,
		error: true,
		message: 'Not found'    
	    });		 
            return;
	 }
	 res.status(200).json({
             success: true,
             error: false,
             data: response,		 
	     message: 'List of collection invite[s]'	 
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

   async acceptRejectCollectionInvite(req,res){
      const errors = validationResult(req);
      const { email, reference_number, collection_reference_number, is_accepted } = req.body;
      try{
         if(!errors.isEmpty()){
            res.status(422).json({ success: false, error: true, message: errors.array() });
            return;
         }
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

         const [ok2,_status] = await getCollectionInviteStatus({ collection_reference_number,reference_number });
	 if(_status === 'pending' && is_accepted === 0){
            res.status(400).json({
                success: false,
                error: true,
                message: 'Failed to accept the invite, ensure is_accepted is set to 1.'
            });
            return;           
	 }else if(_status === 'accepted' && is_accepted === 1){		 
            res.status(400).json({
                success: false,
                error: true,
                message: 'Invite is already accepted.'
            });
            return;		 
	 }else if(_status === 'rejected' && is_accepted === 0){
            res.status(400).json({
                success: false,
                error: true,
                message: 'Invite is already rejected.'
            });
            return;
	 }     
         const ok = await acceptRejectInvite({ collection_reference_number,reference_number,is_accepted });
         if(!ok){
            res.status(404).json({
                success: false,
                error: true,
                message: 'Not found'
            });
            return;
         }
	 const [ok3,_status1] = await getCollectionInviteStatus({ collection_reference_number,reference_number });     
         res.status(200).json({
             success: true,
             error: false,
             message: `Collection invite has been ${_status1}`
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
}

module.exports = new SavedPostController();
