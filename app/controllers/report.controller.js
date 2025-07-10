const { validationResult } = require("express-validator");

const { reportPostExist } = require("./user/wall/reported.post.exist");
const { saveReportedPost } = require('./user/wall/save.reported.post');
const { getPostCountById } = require("./user/wall/post.exist");
const { getUserDetailByReferenceNumber } = require("./user/get.user.details");
const { findUserCountByEmail } = require("./user/find.user.count.by.email");
const { findUserCountByReferenceNumber } = require("./user/find.user.count.by.reference.no");

const { httpReportContentPost } = require('../utils/http.utils');
const { connectToRedis, closeRedisConnection, invalidateUserCache, invalidatePostCache } = require("../cache/redis");

class ReportPostController {

   async reportedPost(req,res){
      let redisClient = null;	   
      const errors = validationResult(req);	   
      const { email, reference_number, feedback, post_id } = req.body;
      try{
         if(!errors.isEmpty()){
            res.status(422).json({ success: false, error: true, message: errors.array() });
            return;
         }
	     
	 const vote_type = "downvote";   
	      
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

	 const reported_post_found = await reportPostExist({ reference_number,post_id });     
	      
         if(reported_post_found[1] > 0){
            res.status(400).json({
                success: false,
                error: true,
                message: `Post with id ${post_id} has been reported by you.`
            });
            return;
         }
	      
	 const userDetail = await getUserDetailByReferenceNumber(reference_number);	
	 const payload = { 
            user_id: userDetail._id,		 
	    email,
            reference_number,
	    vote_type,
	    feedback,
	    post_id 
	 };

	 const response = await saveReportedPost(payload);   
	 if(response[0]){
            redisClient = await connectToRedis();
            await invalidatePostCache(redisClient,post_id);
            await invalidateUserCache(redisClient,email,reference_number);		 
            res.status(201).json({
                success: true,
                error: false,
		data: response[1],   
                message: `Post with ${post_id} has been reported.`
            });          
	 }else{
            res.status(400).json({
                success: false,
                error: true,
                message: response[1]
            });
	 }
      }catch(error){
	 const error_message = error?.message || error?.response || error?.response?.data     
         res.status(500).json({
             success: false,
             error: true,
             message: `Error: ${error_message}`
         });
      }finally{
         if(redisClient){
            await closeRedisConnection(redisClient);
         }
      }  	   
   }
	
   async getPost(req,res){
      const errors = validationResult(req);
      const { email, reference_number, post_id } = req.query;
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
      }catch(error){
         const error_message = error?.message || error?.response || error?.response?.data
         res.status(500).json({
             success: false,
             error: true,
             message: `Error: ${error_message}`
         });
      }
   }
}

module.exports = new ReportPostController();
