const { validationResult } = require("express-validator");
const { findUserCountByEmail } = require("./user/find.user.count.by.email");
const { findUserCountByReferenceNumber } = require("./user/find.user.count.by.reference.no");
const { getUserDetailByReferenceNumber } = require("./user/get.user.details");
const { getWallRecords } = require("./user/wall/get.wall");
const { getWallRecordsByReferenceNumber } = require("./user/wall/get.wall.by.reference.number");
const { saveShowPost } = require("./user/wall/post.show.content");
const { saveSocialPost } = require("./user/wall/post.social.content");
const { saveSharePost } = require("./user/wall/post.share.content");
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
			    data: response[1],	
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
                        media_url: image_url || media_url,
                        caption,
                        item_amount,
			gps_coordinates,     
			post_type: share_on_social_wall === 0 ? 'show-board' : 'cross-list',
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
    const { email, reference_number, media_url, gps_coordinates, caption } = req.body;
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
			gps_coordinates,     
			post_type: 'social-board'     
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
    const { email, reference_number, media_url, caption } = req.body;
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
               media_url: media_url,
               caption,
	       post_type: 'social-ai-board',	   
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
    if(errors.isEmpty()){
        try{
            const email_found = await findUserCountByEmail(email);
            if(email_found > 0){
                const reference_number_found = await findUserCountByReferenceNumber(reference_number);
                if(reference_number_found > 0){
                     const userDetail = await getUserDetailByReferenceNumber(reference_number);
                     if(file){
                         image_url = await uploadImageToCustomStorage(file?.filename);
                     }else{
                         image_url = null;
		     }
		     const bidCloseTime = await addTimeToCurrentDate(close_time);
		     console.log('WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW 0 ', bidCloseTime);	
		     if(bidCloseTime[0]){	
                        const payload = {
                            user_id: userDetail._id,
                            email,
                            reference_number,
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
