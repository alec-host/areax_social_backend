const axios = require("axios");
const { validationResult } = require("express-validator");
const { findUserCountByEmail } = require("./user/find.user.count.by.email");
const { findUserCountByReferenceNumber } = require("./user/find.user.count.by.reference.no");
const { filterJsonAttributes } = require("../utils/filter.json.attributes");

const { BASIC_CORE_AUTH_USERNAME,BASIC_CORE_AUTH_PASSWORD,PRIVACY_STATUS_ENDPOINT } = require("../constants/app_constants");

module.exports.ChangeProfileStatus = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number, privacy_status } = req.body;
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
     const postData = async () => {
        const url = PRIVACY_STATUS_ENDPOINT;
        const auth = {
           username: BASIC_CORE_AUTH_USERNAME,
           password: BASIC_CORE_AUTH_PASSWORD 
        };
        
        const data = {
           email: email,
           reference_number: reference_number,
           privacy_status: privacy_status
        };
        try{
           const response = await axios.post(url, JSON.stringify(data), {
              auth: auth,
              headers: { "Content-Type": "application/json" }
           });
           const excludedKeys = ["tier_reference_number","email_verified","phone_verified","created_at"];
	   const filteredProfileData = filterJsonAttributes((response.data.data),excludedKeys);
           res.status(200).json({
               success: true,
               error: false,
               data: filteredProfileData,	   
               message: "Profile privacy status has been updated."
           }); 
        }catch(error){  
           console.error(error.message);
           res.status(error.response.status).json({
               success: false,
               error: true,
               message: error?.response?.message || error?.response?.data || error?.message || 'Something wrong has happened'
           });			       
        }
     };
     postData(); 		
  }catch(e){	
     if(e){
	console.log(e);     
        res.status(500).json({
            success: false,
            error: true,
            message: e?.response?.message || error?.response?.data || e?.message || 'Something wrong has happened'
        });
     }
  }
};
