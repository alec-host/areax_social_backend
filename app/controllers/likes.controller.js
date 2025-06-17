const { validationResult } = require("express-validator");
const { findUserCountByEmail } = require("./user/find.user.count.by.email");
const { findUserCountByReferenceNumber } = require("./user/find.user.count.by.reference.no");
const { getUserDetailByReferenceNumber } = require("./user/get.user.details");
const { addLike } = require("./user/like/add.like");
const { removeLike } = require("./user/like/remove.like");
const { likeExist } = require("./user/like/like.exist");
const { getLikeCount } = require("./user/like/get.like.count");

module.exports.AddLike = async(req,res) => {
    const errors = validationResult(req);
    const { email, reference_number, post_id } = req.body;
    if(errors.isEmpty()){
        try{
            const email_found = await findUserCountByEmail(email);
            if(email_found > 0){
                const reference_number_found = await findUserCountByReferenceNumber(reference_number);
                if(reference_number_found > 0){
		    const userDetail = await getUserDetailByReferenceNumber(reference_number);	
		    const payload = {
			user_id: userDetail._id,    
			email,
			reference_number,
			post_id    
		    };
		    const hasLike = await likeExist(payload);	
		    if(hasLike[0] && hasLike[1] === 0){	
		       const response = await addLike(payload);
		       if(response[0]){	
                           res.status(200).json({
                               success: true,
                               error: false,
			       data: response[1],	
                               message: "Like added successfully."
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
                            message:  "No allowed. You already have posted a like."
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

module.exports.RemoveLike = async(req,res) => {
    const errors = validationResult(req);
    const { email, reference_number, like_id } = req.body;
    if(errors.isEmpty()){
        try{
            const email_found = await findUserCountByEmail(email);
            if(email_found > 0){
                const reference_number_found = await findUserCountByReferenceNumber(reference_number);
                if(reference_number_found > 0){
                    const userDetail = await getUserDetailByReferenceNumber(reference_number);
                    const payload = {
                       email,
                       reference_number,
                       like_id
                    };
		    const response = await removeLike(payload);
		    console.log(response);	
		    if(response[0]){	
                        res.status(200).json({
                            success: true,
                            error: false,
                            message: response[1]
                        });
		    }else{
                        res.status(404).json({
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

module.exports.GetLikeCount = async(req,res) => {
    const errors = validationResult(req);
    const { email, reference_number, post_id } = req.query;
    if(errors.isEmpty()){
        try{
            const email_found = await findUserCountByEmail(email);
            if(email_found > 0){
                const reference_number_found = await findUserCountByReferenceNumber(reference_number);
                if(reference_number_found > 0){
                    const response = await getLikeCount(post_id);
                    if(response[0]){
                        res.status(200).json({
                            success: true,
                            error: false,
                            count: response[1],
                            message: response[2]
                        });
                    }else{
                        res.status(404).json({
                            success: false,
                            error: true,
                            count: response[1],
                            message: response[2]
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
