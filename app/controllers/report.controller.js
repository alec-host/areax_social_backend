const { validationResult } = require("express-validator");

//const { getPostFlaggedStatusByPostId } = require("./user/wall/flagged.post.status");
const { saveReportedPost } = require('./user/wall/save.reported.post');
const { getUserDetailByReferenceNumber } = require("./user/get.user.details");
const { findUserCountByEmail } = require("./user/find.user.count.by.email");
const { findUserCountByReferenceNumber } = require("./user/find.user.count.by.reference.no");

const { httpReportContentPost } = require('../utils/http.utils');

class ReportPostController {

   async reportedPost(req,res){
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
