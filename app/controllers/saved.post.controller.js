const { validationResult } = require("express-validator");

const { savePost } = require("./user/saved/saved.post");
const { savedPostExist } = require("./user/saved/saved.post.exist");
const { removeSavedPost } = require("./user/saved/remove.saved.post");
const { getPostCountById } = require("./user/wall/post.exist");
const { findUserCountByEmail } = require("./user/find.user.count.by.email");
const { findUserCountByReferenceNumber } = require("./user/find.user.count.by.reference.no");
const { getUserDetailByReferenceNumber } = require("./user/get.user.details");

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

         const post_found = await getPostCountById(post_id);
         if(post_found === 0){
            res.status(404).json({
                success: false,
                error: true,
                message: `Post with id ${post_id} not found.`
            });
            return;
         }
	 
	 const post_found = await savedPostExist({ reference_number,post_id });    
	 if(save_post_found !== 0){
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
	    
         const post_found = await savedPostExist({ reference_number,post_id });
         if(save_post_found !== 0){
            res.status(400).json({
                success: false,
                error: true,
                message: `Post with post_id ${post_id} exist.`
            });
            return;
         }	      

         const response = await removeSavedPost({ email,reference_number,post_id });
         if(response[0]){
            res.status(200).json({
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
