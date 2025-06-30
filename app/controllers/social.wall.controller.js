const { validationResult } = require("express-validator");
const { findUserCountByEmail } = require("./user/find.user.count.by.email");
const { findUserCountByReferenceNumber } = require("./user/find.user.count.by.reference.no");
const { getUserDetailByReferenceNumber } = require("./user/get.user.details");
const { getWallRecords } = require("./user/wall/get.wall");
const { getWallRecordsByReferenceNumber } = require("./user/wall/get.wall.by.reference.number");
const { saveShowPost } = require("./user/wall/post.show.content");
const { saveSocialPost } = require("./user/wall/post.social.content");
const { saveSharePost } = require("./user/wall/post.share.content");
const { removeSocialPost } = require("./user/wall/remove.social.post");
const { saveShowOpenBidPost,saveShowClosedBidPost } = require("./user/wall/post.show.bid.content");
const { uploadImageToCustomStorage } = require("../services/CUSTOM-STORAGE");
const { addTimeToCurrentDate } = require("../utils/future.date.time");

const { SYSTEM_USER_EMAIL, SYSTEM_USER_REFERENCE_NUMBER } = require("../constants/app_constants");

module.exports.GetWallContent = async(req,res) => {
    const errors = validationResult(req);
    const { email, reference_number, post_type, page, limit } = req.query;
    if(errors.isEmpty()){
        try{
            const email_found = await findUserCountByEmail(email);
            if(email_found > 0){
                const reference_number_found = await findUserCountByReferenceNumber(reference_number);
                if(reference_number_found > 0){
		    const response = await getWallRecords(page,limit,post_type);
		    if(response[0]){
                        res.status(200).json({
                            success: true,
                            error: false,
			    data: response[1].data,	
		            pagination: {
			       total: Number(response[1].total),
			       current_page: Number(response[1].currentPage),   	   
			       total_pages: Number(response[1].totalPages)	    
			    },		
                            message: "List of  wall content."
                        });
		    }else{
                        res.status(400).json({
                            success: false,
                            error: true,
                            message: "Error getting wall content."
                        });
		    }
                }else{
                    res.status(404).json({
                        success: false,
                        error: true,
                        message: "Reference number not found."
                    });
                }
            }else{
                res.status(404).json({
                    success: false,
                    error: true,
                    message: "Email not found."
                });
            }
        }catch(e){
            if(e){
		console.error(e);    
                res.status(500).json({
                    success: false,
                    error: true,
                    message: e?.response?.message || e?.message || 'Something wrong has happened'
                });
            }
        }
    }else{
        res.status(422).json({ success: false, error: true, message: errors.array() });
    }
};

module.exports.GetWallContentByReferenceNumber = async(req,res) => {
    const errors = validationResult(req);
    const { email, reference_number, post_type } = req.body;
    if(errors.isEmpty()){
        try{
            const email_found = await findUserCountByEmail(email);
            if(email_found > 0){
                const reference_number_found = await findUserCountByReferenceNumber(reference_number);
                if(reference_number_found > 0){
		     const response = await getWallRecordsByReferenceNumber(reference_number,post_type);	
		     if(response[0]){	
                        res.status(200).json({
                            success: true,
                            error: false,
                            message: "List of your own wall content."
                        });
		     }else{
                        res.status(400).json({
                            success: false,
                            error: true,
                            message: "Error getting your own wall content."
                        });
		     }
                }else{
                    res.status(404).json({
                        success: false,
                        error: true,
                        message: "Reference number not found."
                    });
                }
            }else{
                res.status(404).json({
                    success: false,
                    error: true,
                    message: "Email not found."
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
    }else{
        res.status(422).json({ success: false, error: true, message: errors.array() });
    }
};

module.exports.SaveShowContent = async(req,res) => {
    const errors = validationResult(req);
    const { email, reference_number, media_url, caption, item_amount, gps_coordinates, location_name, share_on_social_wall, is_buy_enabled, is_comment_allowed, is_minted_automatically } = req.body;
    const file = req.file ? req.file : null;	
    if(errors.isEmpty()){
        try{
            const email_found = await findUserCountByEmail(email);
            if(email_found > 0){
                const reference_number_found = await findUserCountByReferenceNumber(reference_number);
                if(reference_number_found > 0){	
		     const userDetail = await getUserDetailByReferenceNumber(reference_number);
		     let image_url;	
		     if(file){
			 image_url = await uploadImageToCustomStorage(file?.filename);	
		     }else{
			 image_url = null;
		     }
                     const payload = {
                        user_id: userDetail._id,
                        email,
                        reference_number,
			username: userDetail.display_name,     
                        profile_image_url: userDetail.profile_picture_url,			     
                        media_url: image_url || media_url,
                        caption,
                        item_amount,
			gps_coordinates,
			location_name,     
			post_type: share_on_social_wall === 0 ? 'show-board' : 'cross-list',
                        is_buy_enabled: is_buy_enabled,			     
			is_comment_allowed: is_comment_allowed,
			is_minted_automatically: is_minted_automatically,     
                     };
                     const response = await saveShowPost(payload);
                     if(response[0]){
                        res.status(200).json({
                            success: true,
                            error: false,
                            message: "Content posted successfully."
                        });
                     }else{
                        res.status(400).json({
                            success: false,
                            error: true,
                            message: response[1]
                        });
                     }			
                }else{
                    res.status(404).json({
                        success: false,
                        error: true,
                        message: "Reference number not found."
                    });
                }
            }else{
                res.status(404).json({
                    success: false,
                    error: true,
                    message: "Email not found."
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
    }else{
        res.status(422).json({ success: false, error: true, message: errors.array() });
    }
};

module.exports.SaveSocialContent = async(req,res) => {
    const errors = validationResult(req);
    const { email, reference_number, media_url, gps_coordinates, caption, location_name, is_buy_enabled, is_comment_allowed, is_minted_automatically } = req.body;
    const file = req.file ? req.file : null;	
    if(errors.isEmpty()){
        try{
	    const email_found = await findUserCountByEmail(email);
            if(email_found > 0){
                const reference_number_found = await findUserCountByReferenceNumber(reference_number);
                if(reference_number_found > 0){
		     const userDetail = await getUserDetailByReferenceNumber(reference_number);	
                     let image_url;
                     if(file){
                         image_url = await uploadImageToCustomStorage(file?.filename);
                     }else{
                         image_url = null;
                     }			
	             const payload = { 
			user_id: userDetail._id,
			email,
			reference_number,
			username: userDetail.display_name,
			profile_image_url: userDetail.profile_picture_url,     
			media_url: image_url || media_url,
			caption,
			location_name,     
			gps_coordinates,     
			post_type: 'social-board',
			is_buy_enabled: is_buy_enabled,
			is_comment_allowed: is_comment_allowed,
			is_minted_automatically: is_minted_automatically     
		     };		
		     const response = await saveSocialPost(payload);
		     if(response[0]){	
                        res.status(200).json({
                            success: true,
                            error: false,
                            message: "Content posted successfully."
                        });
		     }else{
                        res.status(400).json({
                            success: false,
                            error: true,
                            message: response[1]
                        });
		     }
                }else{
                    res.status(404).json({
                        success: false,
                        error: true,
                        message: "Reference number not found."
                    });
                }
            }else{
                res.status(404).json({
                    success: false,
                    error: true,
                    message: "Email not found."
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
    }else{
        res.status(422).json({ success: false, error: true, message: errors.array() });
    }
};

module.exports.SaveShareContent = async(req,res) => {
    const errors = validationResult(req);
    const { email, reference_number, media_url, caption, is_public } = req.body;
    const file = req.file ? req.file : null;	
    if(errors.isEmpty()){
        try{
            const email_found = await findUserCountByEmail(email);
            if(email_found > 0){
                const reference_number_found = await findUserCountByReferenceNumber(reference_number);
                if(reference_number_found > 0){
		     const userDetail = await getUserDetailByReferenceNumber(reference_number);	
                     let image_url;
                     if(file){
                         image_url = await uploadImageToCustomStorage(file?.filename);
                     }else{
                         image_url = null;
                     }			
                     const payload = {
                        user_id: userDetail._id,
                        email,
                        reference_number,
                        media_url: image_url || media_url,
                        caption,
			is_buy_enabled: 0,
			is_minted_automatically: 0,     
			is_public   
                     };
                     const response = await saveSharePost(payload);
                     if(response[0]){
                        res.status(200).json({
                            success: true,
                            error: false,
                            message: "Content posted successfully."
                        });
                     }else{
                        res.status(400).json({
                            success: false,
                            error: true,
                            message: response[1]
                        });
                     }
                }else{
                    res.status(404).json({
                        success: false,
                        error: true,
                        message: "Reference number not found."
                    });
                }
            }else{
                res.status(404).json({
                    success: false,
                    error: true,
                    message: "Email not found."
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
    }else{
        res.status(422).json({ success: false, error: true, message: errors.array() });
    }
};

module.exports.SaveSocialAIContent = async(req,res) => {
   const { media_url, caption, category } = req.body;
   const errors = validationResult(req);
   if(errors.isEmpty()){
        try{
           const payload = {
               user_id: 0,
               email: SYSTEM_USER_EMAIL,
               reference_number: SYSTEM_USER_REFERENCE_NUMBER,
               username: 'ai',
               //profile_image_url: userDetail.profile_picture_url,		   
               media_url: media_url,
               caption,
	       category,		   
	       post_type: 'social-ai-board',
               is_buy_enabled: 0,
	       is_comment_allowed: 1,	   
               is_minted_automatically: 0,		   
           };
           const response = await saveSocialPost(payload);
           if(response[0]){
               res.status(200).json({
                   success: true,
                   error: false,
		   data: response[1],    
                   message: "Content posted successfully."
               });
           }else{
               res.status(400).json({
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
                    message: e?.response?.message || e?.message || 'Something wrong has happened'
                });
            }
        }
    }else{
        res.status(422).json({ success: false, error: true, message: errors.array() });
    }
   	
};

module.exports.SaveShowOpenBidContent = async(req,res) => {
    const errors = validationResult(req);
    const { email, reference_number, media_url, caption, item_amount, gps_coordinates, share_on_social_wall } = req.body;
    const file = req.file ? req.file : null;	
    if(errors.isEmpty()){
        try{
            const email_found = await findUserCountByEmail(email);
            if(email_found > 0){
                const reference_number_found = await findUserCountByReferenceNumber(reference_number);
                if(reference_number_found > 0){
                     const userDetail = await getUserDetailByReferenceNumber(reference_number);
                     let image_url;
                     if(file){
                         image_url = await uploadImageToCustomStorage(file?.filename);
                     }else{
                         image_url = null;
                     }			
                     const payload = {
                        user_id: userDetail._id,
                        email,
                        reference_number,
                        username: userDetail.display_name,
                        profile_image_url: userDetail.profile_picture_url,			     
                        media_url: image_url || media_url,
                        caption,
                        item_amount,
			gps_coordinates,     
                        post_type: share_on_social_wall === 0 ? 'show-board' : 'cross-list',
                     };
                     const response = await saveShowOpenBidPost(payload);
                     if(response[0]){
                        res.status(200).json({
                            success: true,
                            error: false,
                            message: "Content posted successfully."
                        });
                     }else{
                        res.status(400).json({
                            success: false,
                            error: true,
                            message: response[1]
                        });
                     }
                }else{
                    res.status(404).json({
                        success: false,
                        error: true,
                        message: "Reference number not found."
                    });
                }
            }else{
                res.status(404).json({
                    success: false,
                    error: true,
                    message: "Email not found."
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
    }else{
        res.status(422).json({ success: false, error: true, message: errors.array() });
    }
};

module.exports.SaveShowClosedBidContent = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number, media_url, caption, item_amount, gps_coordinates, share_on_social_wall, close_time } = req.body;
  const file = req.file ? req.file : null;	
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
     const userDetail = await getUserDetailByReferenceNumber(reference_number);
     if(file){
        image_url = await uploadImageToCustomStorage(file?.filename);
     }else{
        image_url = null;
     }
     const bidCloseTime = await addTimeToCurrentDate(close_time);
     if(bidCloseTime[0]){	
        const payload = {
           user_id: userDetail._id,
           email,
           reference_number,
           username: userDetail.display_name,
           profile_image_url: userDetail.profile_picture_url,		
           media_url: image_url || media_url,
           caption,
           item_amount,    
           gps_coordinates,     
           post_type: share_on_social_wall === 0 ? 'show-board' : 'cross-list',
	   closed_time: new Date(bidCloseTime[1]),     
        };
        const response = await saveShowClosedBidPost(payload);
        if(response[0]){
           res.status(200).json({
               success: true,
               error: false,
               message: "Content posted successfully."
           });
        }else{
           res.status(400).json({
               success: false,
               error: true,
               message: response[1]
           });
        }
     }else{
         res.status(400).json({
             success: false,
             error: true,
             message: bidCloseTime[1]
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

module.exports.DeleteSocialPost = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number } = req.body;
  const { post_id } = req.params;	
  const file = req.file ? req.file : null;
  if(!errors.isEmpty()){
     res.status(422).json({ success: false, error: true, message: errors.array() });
     return;	  
  }
  try{
     const email_found = await findUserCountByEmail(email);
     if(email === 0){
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
     const response = await removeSocialPost({ post_id, reference_number });
     if(!response[0]){
         res.status(400).json({
             success: false,
             error: true,
             message: response[1]
         });
         return;
     }
     res.status(200).json({ success: true, error: false, message: response[1] });
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
