const { validationResult } = require("express-validator");
const { findUserCountByEmail } = require("./user/find.user.count.by.email");
const { findUserCountByReferenceNumber } = require("./user/find.user.count.by.reference.no");
const { getUserDetailByReferenceNumber } = require("./user/get.user.details");

const { createGroup } = require("./user/group/create.group");
const { addUserToGroup } = require("./user/group/add.user.group");
const { deleteGroup } = require("./user/group/delete.group");
const { deleteMessage } = require("./user/group/delete.group.message");
const { editMessage } = require("./user/group/edit.group.message");
const { getGroupChats } = require("./user/group/get.group.chats");
const { sendMessage } = require("./user/group/group.messaging");
const { removeUserFromGroup } = require("./user/group/remove.user.group");

const { uploadImageToCustomStorage } = require("../services/CUSTOM-STORAGE");

module.exports.CreateGroup = async(req,res) => {
    const errors = validationResult(req);	
    const { email, reference_number, group_name, group_caption } = req.body;
    const file = req.file ? req.file : null;	
    if(errors.isEmpty()){
        try{
            const email_found = await findUserCountByEmail(email);
            if(email_found > 0){
                const reference_number_found = await findUserCountByReferenceNumber(reference_number);
                if(reference_number_found > 0){
                    let image_url;
                    if(file){
                       image_url = await uploadImageToCustomStorage(file?.filename);
                    }else{
                       image_url = null;
                    }
		    const userDetail = await getUserDetailByReferenceNumber(reference_number);	
                    const payload = {
		       admin_id: userDetail._id,
                       admin_reference_number: reference_number,
		       group_name,
		       description: group_caption,
		       background_image: image_url,
		    };			
                    const response = await createGroup(payload);	
                    if(response[0]){
                        res.status(200).json({
                            success: true,
                            error: false,
                            data: response[1],
                            message: "Group has been created"
                        });
                    }else{
                        res.status(400).json({
                            success: false,
                            error: true,
                            message: response[1],
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

module.exports.AddUserToGroup = async(req,res) => {
    const { email, reference_number, friend_id, group_id } = req.body;
    const errors = validationResult(req);	
    if(errors.isEmpty()){
        try{
            const email_found = await findUserCountByEmail(email);
            if(email_found > 0){
                const reference_number_found = await findUserCountByReferenceNumber(reference_number);
                if(reference_number_found > 0){
		    const payload = {
                       group_id,
		       user_id: friend_id,
		       reference_number	    
		    };	
                    const response = await addUserToGroup(payload);
                    if(response[0]){
                        res.status(200).json({
                            success: true,
                            error: false,
                            data: response[1],
                            message: "User added to the group."
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

module.exports.DeleteGroup = async(req,res) => {
    const { email, reference_number } = req.body;
    const { group_id } = req.params;	
    const errors = validationResult(req);	
    if(errors.isEmpty()){
        try{
            const email_found = await findUserCountByEmail(email);
            if(email_found > 0){
                const reference_number_found = await findUserCountByReferenceNumber(reference_number);
                if(reference_number_found > 0){
                    const response = await deleteGroup(group_id);
                    if(response[0]){
                        res.status(200).json({
                            success: true,
                            error: false,
                            message: response[1]
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

module.exports.EditGroupChatMessage = async(req,res) => {
    const { email, reference_number, message, message_id } = req.body;
    const errors = validationResult(req);	
    if(errors.isEmpty()){
        try{
            const email_found = await findUserCountByEmail(email);
            if(email_found > 0){
                const reference_number_found = await findUserCountByReferenceNumber(reference_number);
                if(reference_number_found > 0){
		    const payload = {
                       user_id,
		       message_id,
		       content: message	    
		    };	
                    const response = await editMessage(payload);
                    if(response[0]){
                        res.status(200).json({
                            success: true,
                            error: false,
                            data: response[1],
                            message: "Message has been updated."
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

module.exports.DeleteGroupChatMessage = async(req,res) => {
    const { email, reference_number } = req.body;
    const { message_id, user_id } = req.params;	
    const errors = validationResult(req);	
    if(errors.isEmpty()){
        try{
            const email_found = await findUserCountByEmail(email);
            if(email_found > 0){
                const reference_number_found = await findUserCountByReferenceNumber(reference_number);
                if(reference_number_found > 0){
                    const response = await deleteMessage(message_id,user_id);
                    if(response[0]){
                        res.status(200).json({
			    success: true,
                            error: false,
                            message: response[1]
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
                console.error(e);
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

module.exports.GetGroupChatMessages = async(req,res) => {
    const { email, reference_number, group_id } = req.query;
    const errors = validationResult(req);	
    if(errors.isEmpty()){
        try{
            const email_found = await findUserCountByEmail(email);
            if(email_found > 0){
                const reference_number_found = await findUserCountByReferenceNumber(reference_number);
                if(reference_number_found > 0){
                    const response = await getGroupChats(group_id);
                    if(response[0]){
                        res.status(200).json({
                            success: true,
                            error: false,
                            message: response[1]
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

module.exports.SendGroupChatMessage = async(req,res) => {
    const { email, reference_number, message, media_url, group_id } = req.body;
    const errors = validationResult(req);
    if(errors.isEmpty()){
        try{
            const email_found = await findUserCountByEmail(email);
            if(email_found > 0){
                const reference_number_found = await findUserCountByReferenceNumber(reference_number);
                if(reference_number_found > 0){
		    const payload = {
                       group_id,
		       user_id,	    
		       content: message,
		       media_url	    
		    };	
                    const response = await sendMessage(page,limit,post_type);
                    if(response[0]){
                        res.status(200).json({
                            success: true,
                            error: false,
                            message: response[1]
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

module.exports.RemoveUserFromGroup = async(req,res) => {
    const { email, reference_number } = req.body;	
    const { group_id, friend_reference_number } = req.params;	
    const errors = validationResult(req);
    if(errors.isEmpty()){
        try{
            const email_found = await findUserCountByEmail(email);
            if(email_found > 0){
                const reference_number_found = await findUserCountByReferenceNumber(reference_number);
                if(reference_number_found > 0){
                    const response = await removeUserFromGroup(group_id,user_id);
                    if(response[0]){
                        res.status(200).json({
                            success: true,
                            error: false,
                            message: response[1]
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
