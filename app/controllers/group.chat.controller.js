const { v4: uuidv4 } = require('uuid');
const { validationResult } = require("express-validator");
const { findUserCountByEmail } = require("./user/find.user.count.by.email");
const { findUserCountByReferenceNumber } = require("./user/find.user.count.by.reference.no");
const { getUserDetailByReferenceNumber } = require("./user/get.user.details");

const { createGroup } = require("./user/group/create.group");
const { addUserToGroup } = require("./user/group/add.user.group");
const { deleteGroup } = require("./user/group/delete.group");
const { isGroupAdmin } = require("./user/group/is.group.admin");
const { groupExist } = require("./user/group/group.exist");
const { getGroupMemberCount } = require("./user/group/group.member.count");
const { deleteMessage } = require("./user/group/delete.group.message");
const { editMessage } = require("./user/group/edit.group.message");
const { listGroups } = require("./user/group/list.groups"); 
const { getGroupChats } = require("./user/group/get.group.chats");
const { sendMessage } = require("./user/group/group.messaging");
const { removeUserFromGroup } = require("./user/group/remove.user.group");
const { groupByReferenceNumber } = require("./user/group/group.reference.number.by.id");

const { uploadImageToCustomStorage } = require("../services/CUSTOM-STORAGE");

module.exports.CreateOpenGroup = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number, group_name, group_caption,max_members } = req.body;
  const file = req.file ? req.file : null;
  if(!errors.isEmpty()){
     res.status(422).json({ success: false, error: true, message: errors.array() });
  }
  try{

     const invite_link = `PW-INVT-OG-${uuidv4()}`;
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
     }
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
        group_type: 'open',
        background_image: image_url,
        payment_required: false,
        invite_link,
        max_members
     };
     const response = await createGroup(payload);
     if(!response[0]){
        res.status(400).json({
            success: false,
            error: true,
            message: response[1],
        });
        return;
     }
     res.status(201).json({
         success: true,
         error: false,
         data: response[1],
         message: `Group with name: ${group_name} has been created`
     });
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
};

module.exports.CreatePaidGroup = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number, group_name, group_caption, max_members, price_amount, subscription_interval } = req.body;

  const file = req.file ? req.file : null;
  if(!errors.isEmpty()){
     return res.status(422).json({ success: false, error: true, message: errors.array() });
  }
  try{

     const invite_link = `PW-INVT-PG-${uuidv4()}`;
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
        group_type: 'exclusive',
        background_image: image_url,
        payment_required: true,
        invite_link,
        price_amount,
        price_currency: 'usd',
        subscription_interval,
        max_members
     };
     const response = await createGroup(payload);
     if(!response[0]){
        res.status(400).json({
            success: false,
            error: true,
            message: response[1],
        });
        return;
     }
     res.status(201).json({
         success: true,
         error: false,
         data: response[1],
         message: `Group with name: ${group_name} has been created`
     });
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
};

module.exports.JoinGroup = async(req,res) => {
  const { email, reference_number, invite_link } = req.body;
  const errors = validationResult(req);
  if(!errors.isEmpty()){
     return res.status(422).json({ success: false, error: true, message: errors.array() });
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

     const group = await groupExist(invite_link);
     if(!group[0]){
        res.status(404).json({
            success: false,
            error: true,
            message: "Group not found"
        });
        return;
     }
     const groupMemberCount = await getGroupMemberCount(group[1].group_id);
     if(!groupMemberCount[0]){
        res.status(400).json({
            success: false,
            error: true,
            message: groupMemberCount[1]
        });
        return;
     }

     if(group[1].max_members && groupMemberCount[1] >= group[1].max_members){
        res.status(403).json({
            success: false,
            error: true,
            message: "Group is full"
        });
        return;
     }

     if(group[1].payment_required){
        const hasPaid = true;
        if(!hasPaid){
           return res.status(403).json({ success: false, error: true,  message: 'Payment required before joining' });
        }
     }

     const userDetail = await getUserDetailByReferenceNumber(reference_number);

     const resp = await addUserToGroup({ group_id: group[1].group_id, group_reference_number: group[1].group_reference_number, user_id: userDetail._id, reference_number });
     if(!resp[0]){
        res.status(400).json({
            success: false,
            error: true,
            message: "Failed to add user to a group"
        });
        return;
     }
     res.status(201).json({
         success: true,
         error: false,
         message: resp[1]
     });
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
};

module.exports.AddUserToGroup = async(req,res) => {
  const { email, reference_number, member_reference_number, group_id } = req.body;
  const errors = validationResult(req);
  if(!errors.isEmpty()){
     return res.status(422).json({ success: false, error: true, message: errors.array() });
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
    
     const group = await groupByReferenceNumber(group_id);
     if(!group[0]){
        res.status(404).json({
            success: false,
            error: true,
            message: "Group not found."
        });
        return;
     }

     const userDetail = await getUserDetailByReferenceNumber(member_reference_number);
     if(typeof userDetail === 'undefined'|| userDetail === null){
        res.status(404).json({
            success: false,
            error: true,
            message: "User not found."
        });
        return;
     }
	  
     const payload = {
        group_id,
        group_reference_number: group[1].group_reference_number,
        user_id: userDetail._id,
        reference_number: member_reference_number
     };
	  
     const response = await addUserToGroup(payload);
     if(!response[0]){
        res.status(400).json({
            success: false,
            error: true,
            message: response[1]
        });
	return;     
     }
     res.status(200).json({
         success: true,
         error: false,
         data: response[1],
         message: "User added to the group."
     });
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
};

module.exports.DeleteGroup = async(req,res) => {
  const { email, reference_number } = req.body;
  const { group_id } = req.params;
  const errors = validationResult(req);
  if(!errors.isEmpty()){
     return res.status(422).json({ success: false, error: true, message: errors.array() });
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

     const admin = await isGroupAdmin(reference_number);
     if(!admin[0]){
        res.status(403).json({
            success: false,
            error: true,
            message: "Unauthorized"
        });
        return;
     }
     const response = await deleteGroup(group_id);
     if(!response[0]){
        res.status(400).json({
            success: false,
            error: true,
            message: response[1]
        });
     }
     res.status(200).json({
         success: true,
         error: false,
         message: response[1]
     });
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
};

/*
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
*/

module.exports.RemoveUserFromGroup = async(req,res) => {
  const { email, reference_number, group_id, member_reference_number } = req.body;
  const errors = validationResult(req);
  if(!errors.isEmpty()){
     return res.status(422).json({ success: false, error: true, message: errors.array() });
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

     const admin = await isGroupAdmin(reference_number);
     if(!admin[0]){
        res.status(403).json({
            success: false,
            error: true,
            message: "Unauthorized"
        });
        return;
     }

     const userDetail = await getUserDetailByReferenceNumber(member_reference_number);	  
     if(typeof userDetail === 'undefined'|| userDetail === null){
        res.status(404).json({
            success: false,
            error: true,
            message: "User not found."
        });
        return;
     }

     const response = await removeUserFromGroup(group_id,member_reference_number);	  
     if(!response[0]){
        res.status(400).json({
            success: false,
            error: true,
            message: response[1]
        });
     }
     res.status(200).json({
         success: true,
         error: false,
         message: response[1]
     });
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
};

module.exports.LeaveGroup = async(req,res) => {
  const { email, reference_number, group_id } = req.body;
  const errors = validationResult(req);
  if(!errors.isEmpty()){
     return res.status(422).json({ success: false, error: true, message: errors.array() });
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

     const response = await removeUserFromGroup(group_id,reference_number);
     if(!response[0]){
        res.status(400).json({
            success: false,
            error: true,
            message: 'Leave group operation has failed'
        });
     }
     res.status(200).json({
         success: true,
         error: false,
         message: 'You have left the group'
     });
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
};

module.exports.ListGroups = async(req,res) => {
  const { email, reference_number, page, limit } = req.query;
  const errors = validationResult(req);
  if(!errors.isEmpty()){
     return res.status(422).json({ success: false, error: true, message: errors.array() });
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

     const groupResp = await listGroups(page,limit);
     if(!groupResp[0]){
        res.status(400).json({
            success: false,
            error: true,
            message: 'Failed to fetch group list'
        });
     }
     res.status(200).json({
         success: true,
         error: false,
         data: groupResp[1].data,
         pagination: {
           total: groupResp[1].total,
           currentPage: groupResp[1].currentPage,
           totalPages: groupResp[1].totalPages,
	 },	     
         message: 'List of group[s]'
     });
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
};
