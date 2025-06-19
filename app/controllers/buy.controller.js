const { validationResult } = require("express-validator");
const { findUserCountByEmail } = require("./user/find.user.count.by.email");
const { findUserCountByReferenceNumber } = require("./user/find.user.count.by.reference.no");
const { getUserDetailByReferenceNumber } = require("./user/get.user.details");
const { addBuyItem } = require("./user/buy/add.buy.item");
const { deleteBuyItem } = require("./user/buy/delete.buy.item");
const { editBuyItem } = require("./user/buy/edit.buy.item");

module.exports.EditBuyPostContent = async(req,res) => {
    const errors = validationResult(req);
    const { email, reference_number, post_id, item_amount, caption } = req.body;
    if(errors.isEmpty()){
        try{
            const email_found = await findUserCountByEmail(email);
            if(email_found > 0){
                const reference_number_found = await findUserCountByReferenceNumber(reference_number);
                if(reference_number_found > 0){	
		    const payload = { 
			item_amount,
		        description: caption
		    };
                    const response = await editBuyItem(payload,post_id);
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
                    message: e?.response?.message || 'Something wrong has happened'
                });
            }
        }
    }else{
        res.status(422).json({ success: false, error: true, message: errors.array() });
    }
};

module.exports.DeleteBuyPostContent = async(req,res) => {
    const errors = validationResult(req);
    const { email, reference_number } = req.body;
    const { post_id } = req.params;	
    if(errors.isEmpty()){
        try{
            const email_found = await findUserCountByEmail(email);
            if(email_found > 0){
                const reference_number_found = await findUserCountByReferenceNumber(reference_number);
                if(reference_number_found > 0){
	            const response = await deleteBuyItem(post_id); 
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

module.exports.BuyNow = async(req,res) => {
    const errors = validationResult(req);
    const { email, reference_number, post_id } = req.body;
    if(errors.isEmpty()){
        try{
            const email_found = await findUserCountByEmail(email);
            if(email_found > 0){
                const reference_number_found = await findUserCountByReferenceNumber(reference_number);
                if(reference_number_found > 0){
                    //-make a post request to check prw balance.
                        res.status(200).json({
                            success: true,
                            error: false,
                            message: "Logic not implemented"
                        });
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
                    message: e?.response?.message || 'Something wrong has happened'
                });
            }
        }
    }else{
        res.status(422).json({ success: false, error: true, message: errors.array() });
    }
};
