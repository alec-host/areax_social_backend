const { validationResult } = require("express-validator");

const { savePost } = require("./user/saved/saved.post");
const { removeSavedPost } = require("./user/saved/remove.saved.post");
const { findUserCountByEmail } = require("./user/find.user.count.by.email");
const { findUserCountByReferenceNumber } = require("./user/find.user.count.by.reference.no");

class SavedPostController {
   async addSavedPost(req,res){
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
	 const response = await savePost({ email,reference_number,post_id });     
	 if(respnse[0]){
            res.status(201).json({
                success: true,
                error: false,
		data: response[1],    
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
      }	   
   }

   async removeSavedPost(req,res){
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

         const response = await removeSavedPost({ email,reference_number,post_id });
         if(respnse[0]){
            res.status(201).json({
                success: true,
                error: false,
                data: response[1],
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
      }
   }	
}

module.exports = new SavedPostController();
