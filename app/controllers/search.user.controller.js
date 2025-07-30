const { validationResult } = require("express-validator");

const { searchUserByUsername } = require("./user/search.user.by.username");
const { findUserCountByEmail } = require("./user/find.user.count.by.email");
const { findUserCountByReferenceNumber } = require("./user/find.user.count.by.reference.no");

class SearchUserController {
   async searchUserByUsername(req,res){
      const errors = validationResult(req);
      const { email, reference_number, search_query } = req.body;
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

         const response = await searchUserByUsername(search_query);
         if(!response){
             res.status(400).json({
                 success: false,
                 error: true,
                 message: `No user found.`
             });
             return;
	 }
         res.status(200).json({
             success: true,
             error: false,
	     data: response,    
             message: `User search list`
         });
      }catch(error){
         res.status(500).json({
             success: false,
             error: true,
             message: `Error: ${error?.message}`
         });
      }
   };

   async searchUserByUsernameAndLocation(req,res){
     console.log("No implemented.");	   
   }
};

module.exports = new SearchUserController();
