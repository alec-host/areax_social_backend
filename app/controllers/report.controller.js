const { validationResult } = require("express-validator");
/*
const { getLikeId } = require('./user/like/get.like.id');
const { isLikedFlag } = require('./user/toggle.liked.flag');
const { isSavedFlag } = require('./user/toggle.saved.flag');
const { httpAddLikePost, httpRemoveLikePost } = require('../utils/http.utils');
const { isReportedFlag } = require('./user/toggle.reported.flag');
const { getUploadedFile } = require('./user/file-upload/get.file.by.id');
const { getPaginatedFiles } = require('./user/file-upload/get.files.by.type');
*/
const { saveFlaggingReport } = require('./user/wall/report.social.content');
const { getUserDetailByReferenceNumber } = require("./user/get.user.details");
const { findUserCountByEmail } = require("./user/find.user.count.by.email");
const { findUserCountByReferenceNumber } = require("./user/find.user.count.by.reference.no");

class ReportPostController {

   async savePost(req,res){
      const errors = validationResult(req);	   
      const { email, reference_number, vote_type, feeback, post_id } = req.body;
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
	 const userDetail = await getUserDetailByReferenceNumber(reference_number);     
	 const payload = { 
            user_id: userDetail._id,		 
	    email,
            reference_number,
	    vote_type,
	    feeback,
	    post_id 
	 };     
	 const response = await saveFlaggingReport(payload);   
	 if(response[0]){
            res.status(201).json({
                success: true,
                error: false,
		data: response[1],   
                message: "Report has been saved."
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
