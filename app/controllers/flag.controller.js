const { validationResult } = require("express-validator");

const { getLikeId } = require('./user/like/get.like.id');
const { isLikedFlag } = require('./user/toggle.liked.flag');
const { isSavedFlag } = require('./user/toggle.saved.flag');
const { httpAddLikePost, httpRemoveLikePost } = require('../utils/http.utils');
const { isReportedFlag } = require('./user/toggle.reported.flag');
const { findUserCountByEmail } = require("./user/find.user.count.by.email");
const { findUserCountByReferenceNumber } = require("./user/find.user.count.by.reference.no");

class FlagController {
   async toggleLikeFlag(req,res) {
      const errors = validationResult(req);	
      const { email, reference_number, flag } = req.body;	
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

         if(!post_id || post_id === ':post_id'){
            res.status(400).json({
                success: false,
                error: true,
                message: "Missing: post_id & must be checked."
            });
            return;
         }
	      
	 const response = await isLikedFlag({ email,reference_number,post_id,flag });
	 if(response[0]){
	     let _msg = null;	 
	     if(response[1]){
                _msg = 'true';		     
		const payload = { email,reference_number,post_id };     
		await httpAddLikePost(payload);     
	     }else{
		_msg = 'false';     
		const resp = await getLikeId(email,reference_number,post_id);   
		const like_id = resp[1]; 
		const payload = { email,reference_number,like_id };     
                await httpRemoveLikePost(payload);
	     }	 
             res.status(200).json({
                 success: true,
                 error: false,
                 message: `Like has been updated to ${_msg}`
             });
	 }else{
             res.status(400).json({
                 success: false,
                 error: true,
                 message: `Failed to update the like`
             });
	 }     
      }catch(error){
         res.status(500).json({
             success: false,
             error: true,
             message: `Error: ${error?.message}`
         });      
      }
   };

   async toggleSaveFlag(req,res) {
      const errors = validationResult(req);
      const { email, reference_number, flag } = req.body;
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

         if(!post_id || post_id === ':post_id'){
            res.status(400).json({
                success: false,
                error: true,
                message: "Missing: post_id & must be checked."
            });
            return;
         }
	      
         const response = await isSavedFlag({ email,reference_number,post_id,flag });
         if(response){
             res.status(200).json({
                 success: true,
                 error: false,
                 message: `Saved flag has been updated to ${flag}`
             });
         }else{
             res.status(400).json({
                 success: false,
                 error: true,
                 message: `Failed to update.`
             });
         }
      }catch(error){
         res.status(500).json({
             success: false,
             error: true,
             message: `Error: ${error?.message}`
         });
      }
   };

   async toggleReportFlag(req,res) {
      const errors = validationResult(req);
      const { email, reference_number, flag } = req.body;
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

         if(!post_id || post_id === ':post_id'){
            res.status(400).json({
                success: false,
                error: true,
                message: "Missing: post_id & must be checked."
            });
            return;
         }

         const response = await isReportedFlag({ email,reference_number,post_id,flag });
         if(response){
             res.status(200).json({
                 success: true,
                 error: false,
                 message: `Reported flag has been updated to ${flag}`
             });
         }else{
             res.status(400).json({
                 success: false,
                 error: true,
                 message: `Failed to update.`
             });
         }
      }catch(error){
         res.status(500).json({
             success: false,
             error: true,
             message: `Error: ${error?.message}`
         });
      }
   };	
}

module.exports = new FlagController();
