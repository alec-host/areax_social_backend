const { v4: uuidv4 } = require('uuid');
const { validationResult } = require("express-validator");
const { findUserCountByEmail } = require("./user/find.user.count.by.email");
const { findUserCountByReferenceNumber } = require("./user/find.user.count.by.reference.no");
const { getUserDetailByReferenceNumber } = require("./user/get.user.details");

const { createGroup } = require("./user/group/create.group");
const { addUserToGroup } = require("./user/group/add.user.group");
const { deleteGroup } = require("./user/group/delete.group");
const { isGroupAdmin } = require("./user/group/is.group.admin");
const { groupInviteLinkExist } = require("./user/group/group.invite.link");
const { groupById } = require("./user/group/group.by.id");
const { getGroupMemberCount } = require("./user/group/group.member.count");
const { deleteMessage } = require("./user/group/delete.group.message");
const { editMessage } = require("./user/group/edit.group.message");
const { listGroups } = require("./user/group/list.groups"); 
const { getGroupChats } = require("./user/group/get.group.chats");
const { sendMessage } = require("./user/group/group.messaging");
const { removeUserFromGroup } = require("./user/group/remove.user.group");
const { groupByReferenceNumber } = require("./user/group/group.reference.number.by.id");
const { modifyGroupByReferenceNumber } = require("./user/group/modify.group.by.reference.number");
const { groupPayment } = require("./user/group/group.payment");
const { groupSubscription } = require("./user/group/group.subscription");
const { groupPaymentStatus } = require("./user/group/group.payment.status");
const { groupSubscriptionStatus } = require("./user/group/group.subscription.status");
const { createGroupPayment } = require("./user/group/create.payment");
const { createGroupSubscription } = require("./user/group/create.subscription");

//const { stripeService } = require("../services/STRIPE_GROUPS");

const { uploadImageToCustomStorage } = require("../services/CUSTOM-STORAGE");

module.exports.CreateOpenGroup = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number, group_name, group_caption, max_members } = req.body;
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
  const { email, reference_number, group_name, group_caption, max_members, is_secret_group, live_stream_support, event_support, buy_sell_support, gift_token_support } = req.body;

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
        payment_required: false,
        invite_link,
        price_currency: 'usd',
        max_members,
	is_secret_group,
	live_stream_support, 
	event_support, 
	buy_sell_support, 
	gift_token_support     
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

     const groupInvite = await groupInviteLinkExist(invite_link);
     if(!groupInvite[0]){
        res.status(404).json({
            success: false,
            error: true,
            message: groupInvite[1]
        });
        return;
     }

     const groupMemberCount = await getGroupMemberCount(groupInvite[1].group_id);
     if(!groupMemberCount[0]){
        res.status(400).json({
            success: false,
            error: true,
            message: groupMemberCount[1]
        });
        return;
     }

     if(groupInvite[1].max_members && groupMemberCount[1] >= groupInvite[1].max_members){
        res.status(403).json({
            success: false,
            error: true,
            message: "Group is full"
        });
        return;
     }

     if(groupInvite[1].payment_required){
        const hasPaid = await groupPaymentStatus(email,reference_number,groupInvite[1].group_id) || await groupSubscriptionStatus(email,reference_number,groupInvite[1].group_id);
        if(!hasPaid){
           return res.status(403).json({ success: false, error: true,  message: 'Payment required' });
        }
     }

     const userDetail = await getUserDetailByReferenceNumber(reference_number);

     const resp = await addUserToGroup({ group_id: groupInvite[1].group_id, group_reference_number: groupInvite[1].group_reference_number, user_id: userDetail._id, reference_number });
     if(!resp[0]){
        res.status(400).json({
            success: false,
            error: true,
            message: resp[1]
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
  const { email, reference_number, member_reference_number, group_reference_number } = req.body;
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
     
     const group = await groupByReferenceNumber(group_reference_number);
     if(!group[0]){
        res.status(404).json({
            success: false,
            error: true,
            message: group[1]
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
	group_id: group[1].group_id,
        group_reference_number,
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
  const { group_reference_number } = req.params;
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

     const group = await groupByReferenceNumber(group_reference_number);	  
     if(!group[0]){
        res.status(404).json({
            success: false,
            error: true,
            message: group[1]
        });
        return;
     }
	  
     const response = await deleteGroup(group[1].group_id);
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
  const { email, reference_number, group_reference_number, member_reference_number } = req.body;
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

     const group = await groupByReferenceNumber(group_reference_number);
     if(!group[0]){
        res.status(404).json({
            success: false,
            error: true,
            message: group[1]
        });
        return;
     }
	  
     const response = await removeUserFromGroup(group[1].group_id,member_reference_number);	  
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
  const { email, reference_number, group_reference_number } = req.body;
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

     const group = await groupByReferenceNumber(group_reference_number);
     if(!group[0]){
        res.status(404).json({
            success: false,
            error: true,
            message: group[1]
        });
        return;
     }
	  
     const response = await removeUserFromGroup(group[1].group_id,reference_number);
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

module.exports.InitiatePayment = async(req,res) => {
  const { email, reference_number, group_reference_number } = req.body;
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

     const userDetail = await getUserDetailByReferenceNumber(reference_number);	  

     const group = await groupByReferenceNumber(group_reference_number);
     if(!group[0]){
        res.status(404).json({
            success: false,
            error: true,
            message: group[1]
        });
        return;
     }
	  
     if(!group[1].payment_required){
        res.status(404).json({
            success: false,
            error: true,
            message: "Paid group not found"
        });
        return;
     } 

     const hasPaid = await groupPayment(email,reference_number,group[1].group_id) || await groupSubscription(email,reference_number,group[1].group_id);	  
     if(hasPaid){
        res.status(400).json({
            success: false,
            error: true,
            message: "You already have access to this group."
        });
        return;        
     }	
     let paymentIntent;
     if(group[1].payment_type === 'subscription'){
        const customer = await stripeService.createCustomer(group[1]);
	const subscription = await stripeService.createSubscription(customer.id,group[1].stripe_price_id,{ group_reference_number: group[1].group_reference_number, user_reference_id: reference_number }); 
	//-.create subscription.     
	const payload = {
	   group_id: group[1].group_id,
	   group_reference_number,	
	   user_id: userDetail._id,
	   user_email: email,
	   user_reference_number: reference_number,
	   stripe_subscription_id: subscription.id,
	   status: subscription.status,
	   current_period_start: new Date(subscription.current_period_start * 1000),
	   current_period_end: new Date(subscription.current_period_end * 1000),
           created_at: new Date()		
	};
	const responseSubscription = await createGroupSubscription(payload);     
        res.status(200).json({
            success: true,
            error: false,
	    data: { subscription_id: subscription.id },	
            message: "Subscription initiated"
	});     
     }else{
        paymmentIntent = await stripeService.createPaymentIntent(group[1].price_amount,group[1].price_currency,{ group_reference_number: group[1].group_reference_number, user_reference_id: reference_number });
	//-.create payment user.
        const payload = {
	   group_id: group[1].group_id,
           group_reference_number,		
	   user_id: userDetail._id,
	   user_email: email,
	   user_reference_number: reference_number,
	   payment_type: group[1].payment_type,
	   amount: group[1].price_amount,
           currency: group[1].price_currency,		
	   stripe_payment_intent_id: paymentIntent.id,
	   status: 'pending',
	   payment_date: new Date()
	};
        res.status(200).json({
            success: true,
            error: false,
            data: { client_secret: paymentIntent.client_secret,payment_intent_id: paymentIntent.id },
            message: "Payment intent"
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
};

module.exports.AddGroupBackgroundImage = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number, group_reference_number } = req.body;
  const file = req.file ? req.file : null;
  if(!errors.isEmpty()){
     res.status(422).json({ success: false, error: true, message: errors.array() });
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
     }
     let image_url;
     if(file){
        image_url = await uploadImageToCustomStorage(file?.filename);
     }else{
        image_url = null;
     }

     const group = await groupByReferenceNumber(group_reference_number);
     if(!group[0]){
        res.status(404).json({
            success: false,
            error: true,
            message: group[1]
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

     const payload = {
        background_image: image_url
     };
     const response = await modifyGroupByReferenceNumber(group_reference_number,payload); 
     if(!response){
        res.status(400).json({
            success: false,
            error: true,
            message: "Failed to update background image",
        });
        return;
     }
     res.status(200).json({
         success: true,
         error: false,
         message: `Group background image has been updated`
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

module.exports.AddGroupName = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number, group_name, group_reference_number } = req.body;
  if(!errors.isEmpty()){
     res.status(422).json({ success: false, error: true, message: errors.array() });
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
     }

     const group = await groupByReferenceNumber(group_reference_number);
     if(!group[0]){
        res.status(404).json({
            success: false,
            error: true,
            message: group[1]
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

     const payload = {
        group_name
     };
     const response = await modifyGroupByReferenceNumber(group_reference_number,payload);
     if(!response){
        res.status(400).json({
            success: false,
            error: true,
            message: "Failed to update group name",
        });
        return;
     }
     res.status(200).json({
         success: true,
         error: false,
         message: `Group name has been updated`
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

module.exports.AddGroupCaption = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number, group_caption, group_reference_number } = req.body;
  if(!errors.isEmpty()){
     res.status(422).json({ success: false, error: true, message: errors.array() });
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
     }

     const group = await groupByReferenceNumber(group_reference_number);
     if(!group[0]){
        res.status(404).json({
            success: false,
            error: true,
            message: group[1]
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

     const payload = {
	description: group_caption
     };
     const response = await modifyGroupByReferenceNumber(group_reference_number,payload);
     if(!response){
        res.status(400).json({
            success: false,
            error: true,
            message: "Failed to update group caption",
        });
        return;
     }
     res.status(200).json({
         success: true,
         error: false,
         message: `Group caption has been updated`
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
