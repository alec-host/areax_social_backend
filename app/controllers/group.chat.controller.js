const { v4: uuidv4 } = require('uuid');
const { validationResult } = require("express-validator");
const { findUserCountByEmail } = require("./user/find.user.count.by.email");
const { findUserCountByReferenceNumber } = require("./user/find.user.count.by.reference.no");
const { getUserDetailByReferenceNumber } = require("./user/get.user.details");

const { createGroup } = require("./user/group/create.group");
const { addUserToGroup } = require("./user/group/add.multiple.user.group");
const { deleteGroup } = require("./user/group/delete.group");
const { isGroupAdmin } = require("./user/group/is.group.admin");
const { groupInviteLinkExist } = require("./user/group/group.invite.link");
const { groupOpenInviteLinkExist } = require("./user/group/group.open.invite");
const { groupById } = require("./user/group/group.by.id");
const { getGroupMemberCount } = require("./user/group/group.member.count");
const { deleteMessage } = require("./user/group/delete.group.message");
const { editMessage } = require("./user/group/edit.group.message");
const { listGroups } = require("./user/group/list.groups"); 
const { getGroupChats } = require("./user/group/get.group.chats");
const { sendMessage } = require("./user/group/group.messaging");
const { removeUserFromGroup } = require("./user/group/remove.user.group");
const { groupByReferenceNumber } = require("./user/group/group.by.reference.no");
const { modifyGroupByReferenceNumber } = require("./user/group/modify.group.by.reference.number");
const { groupPayment } = require("./user/group/group.payment");
const { groupSubscription } = require("./user/group/group.subscription");
const { groupPaymentStatus } = require("./user/group/group.payment.status");
const { groupSubscriptionStatus } = require("./user/group/group.subscription.status");
const { createGroupPayment } = require("./user/group/create.payment");
const { createGroupSubscription } = require("./user/group/create.subscription");
const { updateGroupMemberRole } = require("./user/group/group.change.user.membership.role");
const { muteGroupMember } = require("./user/group/group.mute.user");
const { unmuteGroupMember } = require("./user/group/group.unmute.user");
const { getGroupActivityMetrics } = require("../utils/group.activity.metrics");
const { getUserGroupActivity } = require("../utils/user.group.activity.metrics");
const { findGroupUserMemberShipCount } = require("./user/group/group.user.membership");
const { getGroupMembers } = require("./user/group/group.member.list");
const { sendInAppNotification } = require("../services/IN-APP-NOTIFICATION");
const { generateGroupInvite } = require("./user/group/group.invites");
const { getGroupInvites } = require("./user/group/get.group.invites");
const { getGroupAdminInvites } = require("./user/group/get.group.admin.invites");
const { updateGroupUserMembership } = require("./user/group/group.member.switch.active");
const { deleteGroupUserInviteMembership } = require("./user/group/group.reject.invite");
const { updateProfilePictureByReferenceNumber } = require("./user/group/group.change.profile.picture");
const { reportGroupMember } = require("./user/group/group.member.report");
const { getReportedGroupMembers } = require("./user/group/get.group.reported.members");
const { reviewReportedGroupMember } = require("./user/group/group.member.review.report");
//const axiosInstance = require("../utils/axios.instance");
//const { fetchProfilePictures } = require("./user/group/get.user.profile.url");
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
	profile_picture_url: userDetail.profile_picture_url,   
	name: userDetail.username || userDetail.display_name,     
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

module.exports.CreatePrivateGroup = async(req,res) => {
  const errors = validationResult(req);
  const { email, reference_number, group_name, group_caption, max_members, event_support, live_stream_support, buy_sell_support, gift_token_support, is_secret_group } = req.body;
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
	profile_picture_url: userDetail.profile_picture_url,     
	name: userDetail.username || userDetail.display_name,     
        group_name,
        description: group_caption,
        group_type: 'private',
        background_image: image_url,
        payment_required: false,
        invite_link,
        max_members,
        is_private: 1,
        event_support, 
	live_stream_support, 
	buy_sell_support, 
	gift_token_support, 
	is_secret_group	     
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
         message: `Private group with name: ${group_name} has been created`
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
	profile_picture_url: userDetail.profile_picture_url,     
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

module.exports.SendGroupInvite = async(req,res) => {
  const { email, reference_number } = req.body;
  const errors = validationResult(req);
  if(!errors.isEmpty()){
     return res.status(422).json({ success: false, error: true, message: errors.array() });
  }
  try{
     
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

module.exports.JoinPrivateGroupWithDynamicInviteLink = async(req,res) => {
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

     const [ok,groupInvite] = await groupInviteLinkExist(invite_link);
     if(!ok){
        res.status(404).json({
            success: false,
            error: true,
            message: groupInvite
        });
        return;
     }

     const [ok2, groupMemberCount] = await getGroupMemberCount(groupInvite.group_id);
     if(!ok2){
        res.status(400).json({
            success: false,
            error: true,
            message: groupMemberCount
        });
        return;
     }

     if(groupInvite.max_members && groupMemberCount >= groupInvite.max_members){
        res.status(403).json({
            success: false,
            error: true,
            message: "Group is full"
        });
        return;
     }
     
     const [ok3, groupUpdate] = await updateGroupUserMembership(reference_number,groupInvite.group_reference_number,{ joined_at: new Date(),is_active: 1 }); 
     if(!ok3){
        res.status(400).json({
            success: false,
            error: true,
            message: groupUpdate
        });	     
        return;
     }

     res.status(200).json({
         success: true,
         error: false,
         message: groupUpdate
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

module.exports.RejectGroupInvite = async(req,res) => {
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
	  
     const [ok, groupDeleteInviteResponse] = await deleteGroupUserInviteMembership(reference_number,group_reference_number);
     if(!ok){
        res.status(400).json({
            success: false,
            error: true,
            message: 'Deleting user group invite & membership'
        });
        return;
     }

     res.status(200).json({
         success: true,
         error: false,
         message: 'Invite has been deleted.'
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
	    
module.exports.JoinOpenGroupWithGroupInviteLink = async(req,res) => {
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

     const groupInvite = await groupOpenInviteLinkExist(invite_link);
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

     const userDetail = await getUserDetailByReferenceNumber(reference_number);
    
     const payload = { 
	group_id: groupInvite[1].group_id, 
	group_reference_number: groupInvite[1].group_reference_number, 
	user_id: userDetail._id,
	group_type: groupInvite[1].group_type,
	member_reference_numbers: [reference_number] 
     };

     let whichMessage = 0;	  
     const [success,memberStatus] = await findGroupUserMemberShipCount(reference_number,groupInvite[1].group_reference_number);
     if(success && memberStatus.has_pending_request === 1){
	whichMessage = 1;     
        await deleteGroupUserInviteMembership(reference_number,groupInvite[1].group_reference_number);
     }
	 
     const [ok,response] = await addUserToGroup(payload);
     if(!ok){
        res.status(400).json({
            success: false,
            error: true,
            message: response
        });
        return;
     }

     res.status(200).json({
         success: true,
         error: false,
         message: whichMessage === 0 ? "User has been added to the group." : "User has accepted to join the group."
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

/*
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
*/

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
	return;     
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
	return;     
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

module.exports.AddMultipleUsersToGroup = async(req,res) => {
  const { email, reference_number, group_reference_number, member_reference_numbers } = req.body;
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

     const groupMemberCount = await getGroupMemberCount(group[1].group_id);
     if(!groupMemberCount[0]){
        res.status(400).json({
            success: false,
            error: true,
            message: groupMemberCount[1]
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
	
     let groupType = group[1].group_type;  

     if(group[1].max_members && groupMemberCount[1] >= group[1].max_members){
        res.status(403).json({
            success: false,
            error: true,
            message: "Group is full"
        });
        return;
     }	  
	  
     const userDetail = await getUserDetailByReferenceNumber(reference_number);

     const payload = {
        group_id: group[1].group_id,
        group_reference_number,
        group_type: group[1].group_type,
        user_id: userDetail._id,
        member_reference_numbers
     };  
     const [ok,response] = groupType === 'private' ? await addUserToGroup(payload) : await addUserToGroup(payload,1) ;
     if(!ok){
        res.status(400).json({
            success: false,
            error: true,
            message: response
        });
        return;
     }
   
     if(response.added_count > 0){ 
        const emailList = response.added_users 
          .map(user => `'${user.email}'`)
          .filter(email => typeof email === 'string' &&  email !== "''")
          .join(',');

	const referenceNumberList = response.added_users
          .map(user => user.reference_number) // no quotes needed
          .filter(ref => typeof ref === 'string' && ref.trim() !== '');

	console.log('EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE ',emailList);
	console.log('RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR  ', referenceNumberList);     

        const title = "Group Invite";
        const message = `You have been invited to a Group: ${group[1].group_name}.`;

        const payload = {
           title: title,
           message: message,
           image_url: null,
           users: [emailList],
           notification_for: "2"
        };
        //-send a notification.
        await sendInAppNotification(payload);
	//-log the invite requests.
	const payloadInvite = { 
           group_id: group[1].group_id,
           group_reference_number,
           group_name: group[1].group_name,
           group_photo_url: group[1].background_image,		
           max_members: group[1].max_members,
           group_type: group[1].group_type,
           is_secret_group: group[1].is_secret_group,
           admin_invite: 1,	
           invite_link: group[1].invite_link,		
           recipient_reference_number: referenceNumberList 
	};     
        
	const p = await generateGroupInvite(payloadInvite);
 	console.log(p);
     }
	  
     res.status(201).json({
         success: true,
         error: false,
         message: 'User[s] added to the group'
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

module.exports.ChangeUserRoleGroup = async(req,res) => {
  const { email, reference_number, group_reference_number, member_reference_number, role } = req.query;
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

     const admin = await isGroupAdmin(reference_number);
     if(!admin[0]){
        res.status(403).json({
            success: false,
            error: true,
            message: "Unauthorized"
        });
        return;
     }
	  
     const [ok,response] = await updateGroupMemberRole(group_reference_number, member_reference_number, role);
     if(!ok){
        res.status(400).json({
            success: false,
            error: true,
            message: response
        });
	return;     
     }
     res.status(200).json({
         success: true,
         error: false,
         message: response
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

module.exports.MuteUserInGroup = async(req,res) => {
  const { email, reference_number, group_reference_number, member_reference_number, reason } = req.body;
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

     const admin = await isGroupAdmin(reference_number);
     if(!admin[0]){
        res.status(403).json({
            success: false,
            error: true,
            message: "Unauthorized"
        });
        return;
     }

     const [success,memberStatus] = await findGroupUserMemberShipCount(member_reference_number,group_reference_number);
     if(success && memberStatus.is_member === 0){
        res.status(400).json({
            success: false,
            error: true,
            message: "The user is not a member of the group."
        });
        return;
     }

     if(success && memberStatus.is_muted === 1){
        res.status(400).json({
            success: false,
            error: true,
            message: "The user is already muted."
        });
        return;
     }	  
       
     const [ok,groupResp] = await muteGroupMember(group_reference_number,member_reference_number,reference_number,reason);
     if(!ok){
        res.status(400).json({
            success: false,
            error: true,
            message: groupResp
        });
	return;     
     }
     res.status(200).json({
         success: true,
         error: false,
         message: groupResp
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

module.exports.UnmuteUserInGroup = async(req,res) => {
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

     const [success,memberStatus] = await findGroupUserMemberShipCount(member_reference_number,group_reference_number);
     if(success && memberStatus.is_member === 0){
        res.status(400).json({
            success: false,
            error: true,
            message: "The user is not a member of the group."
        });
        return;
     }	  

     if(success && memberStatus.is_muted === 0){
        res.status(400).json({
            success: false,
            error: true,
            message: "The user is not muted."
        });
        return;
     }

     const [ok,groupResp] = await unmuteGroupMember(group_reference_number,member_reference_number);
     if(!ok){
        res.status(400).json({
            success: false,
            error: true,
            message: groupResp
        });
        return;
     }
     res.status(200).json({
         success: true,
         error: false,
         message: groupResp
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

module.exports.GroupActivityMetrics = async(req,res) => {
  const { email, reference_number, group_reference_number } = req.query;
  const errors = validationResult(req);
  let redisClient = null;
  if(!errors.isEmpty()){
     return  res.status(422).json({ success: false, error: true, message: errors.array() });
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

      const group = await groupByReferenceNumber(group_reference_number);
      if(!group[0]){
         res.status(404).json({
             success: false,
             error: true,
             message: group[1]
         });
         return;
      }
	  
      const stats = await getGroupActivityMetrics(group_reference_number);
      res.status(200).json({
          success: true,
          error: false,
          data: stats,
          message: "Group activity metrics."
      });
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

module.exports.UserGroupActivityMetrics = async(req,res) => {
  const { email, reference_number, group_reference_number, target_reference_number } = req.query;
  const errors = validationResult(req);
  let redisClient = null;
  if(!errors.isEmpty()){
     return  res.status(422).json({ success: false, error: true, message: errors.array() });
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

      const group = await groupByReferenceNumber(group_reference_number);
      if(!group[0]){
         res.status(404).json({
             success: false,
             error: true,
             message: group[1]
         });
         return;
      }

      const [ok,stats] = await getUserGroupActivity(group_reference_number,target_reference_number);
      if(!ok){
         res.status(400).json({
             success: false,
             error: true,
             message: stats
         });
         return;
      }	  
      res.status(200).json({
          success: true,
          error: false,
          data: stats,
          message: "User's group activity metrics."
      });
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

module.exports.GroupMembershipStatus = async(req,res) => {
  const { email, reference_number, group_reference_number } = req.query;
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
     
     const [ok,memberStatus] = await findGroupUserMemberShipCount(reference_number,group_reference_number);	 
     if(!ok){
        res.status(400).json({
            success: false,
            error: true,
            is_member:  memberStatus.is_member,		
            is_muted: memberStatus.is_muted,
            has_pending_request: memberStatus.has_pending_request,	
            message: `User status to group: ${group_reference_number}`
        });
        return;
     }	  
     res.status(200).json({
         success: true,
         error: false,
         is_member:  memberStatus.is_member,
         is_muted: memberStatus.is_muted,
         has_pending_request: memberStatus.has_pending_request,	     
         message: `User status to group: ${group_reference_number}`
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

module.exports.GroupMembershipList = async(req,res) => {
  const { email, reference_number, group_reference_number, page, limit } = req.query;
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

     const [ok,members] = await getGroupMembers(group_reference_number,page,limit);
     if(!ok){
        res.status(404).json({
            success: false,
            error: true,
            message: `No member found in a group with ref: ${group_reference_number}`
        });
        return;
     }
     res.status(200).json({
         success: true,
         error: false,
         data: members.data,
         message: `Member[s] to a group with ref: ${group_reference_number}`
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

module.exports.GroupUserInvites = async(req,res) => {
  const { email, reference_number } = req.query;
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

     const [ok,invites] = await getGroupInvites(reference_number);
     if(!ok){
        res.status(404).json({
            success: false,
            error: true,
            message: `No group invite[s] found.`
        });
        return;
     }
     res.status(200).json({
         success: true,
         error: false,
         data: invites.data,
         message: `Pending list of group invites.`
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

module.exports.GroupAdminInvites = async(req,res) => {
  const { email, reference_number, group_reference_number } = req.query;
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

     const admin = await isGroupAdmin(reference_number);
     if(!admin[0]){
        res.status(403).json({
            success: false,
            error: true,
            message: "Unauthorized"
        });
        return;
     }	  

     const [ok,invites] = await getGroupAdminInvites(group_reference_number);
     if(!ok){
        res.status(404).json({
            success: false,
            error: true,
            message: `No invite[s] found.`
        });
        return;
     }
     res.status(200).json({
         success: true,
         error: false,
         data: invites.data,
         message: `Pending invite[s.]`
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

module.exports.ChangeGroupMemberProfilePicture = async(req,res) => {
  const { email, reference_number, picture_url } = req.body;
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

     const [ok,response] = await updateProfilePictureByReferenceNumber(reference_number,picture_url);
     if(!ok){
        res.status(404).json({
            success: false,
            error: true,
            message: response
        });
        return;
     }
	  
     res.status(200).json({
         success: true,
         error: false,
         message: response
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

module.exports.SendJoinGroupRequest = async(req,res) => {
  const { email, reference_number, group_reference_number} = req.body;
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

     const [success,memberStatus] = await findGroupUserMemberShipCount(reference_number,group_reference_number);
     if(success && memberStatus.is_member === 1){
        res.status(400).json({
            success: false,
            error: true,
            message: "You already a member of the group."
        });
        return;
     }

     if(success && memberStatus.has_pending_request === 1){
        res.status(400).json({
            success: false,
            error: true,
            message: "You have a pending group request."
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

     const userDetail  = await getUserDetailByReferenceNumber(reference_number);
     const adminDetail = await getUserDetailByReferenceNumber(group[1].admin_reference_number);	  

     const payload = {
        group_id: group[1].group_id,
        group_reference_number,
        user_id: userDetail._id,
        member_reference_numbers: [reference_number]
     };

     const [ok,response] = await addUserToGroup(payload);
     if(!ok){
        res.status(400).json({
            success: false,
            error: true,
            message: response
        });
        return;
     }

     if(response.added_count > 0){
        const referenceNumberList = response.added_users
          .map(user => user.reference_number) // no quotes needed
          .filter(ref => typeof ref === 'string' && ref.trim() !== '');

        const title = "Join Group";
        const message = `You have new a request to join your group.`;

        const payload = {
           title: title,
           message: message,
           image_url: null,
           users: [adminDetail.email],
           notification_for: "2"
        };
        //-send a notification.
        //await sendInAppNotification(payload);
        //-log the invite requests.
        const payloadInvite = {
           group_id: group[1].group_id,
           group_reference_number,
           group_name: group[1].group_name,
           group_photo_url: group[1].background_image,		
           max_members: group[1].max_members,
           group_type: group[1].group_type,
           is_secret_group: group[1].is_secret_group,
           admin_invite: 0,		
           invite_link: group[1].invite_link,		
           recipient_reference_number: referenceNumberList
        };
        const p = await generateGroupInvite(payloadInvite);
        console.log(p);
     }

     res.status(200).json({
         success: true,
         error: false,
         message: `Your request to join: ${group[1].group_name} has been sent.`
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

module.exports.GroupAdminApproveRejectInviteRequest = async(req,res) => {
  const { email, reference_number, group_reference_number, recipient_reference_number, is_approved } = req.body;
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

     const admin = await isGroupAdmin(reference_number);
     if(!admin[0]){
        res.status(403).json({
            success: false,
            error: true,
            message: "Unauthorized"
        });
        return;
     }

     const [ok,memberStatus] = await findGroupUserMemberShipCount(recipient_reference_number,group_reference_number);
     if(ok && memberStatus.has_pending_request === 0){
        res.status(400).json({
            success: false,
            error: true,
            message: "No pending group request found."
        });	     
        return;
     }
	  
     const inviteeDetail = await getUserDetailByReferenceNumber(recipient_reference_number);

     const title = 'Status of Your Group Request';	  
     let message = null;
     if(is_approved === 0){
	message = `Your request to join the group "${group[1].group_name}" has been rejected.`;     
        const [ok, groupDeleteInviteResponse] = await deleteGroupUserInviteMembership(recipient_reference_number,group_reference_number);
        if(!ok){
           res.status(400).json({
               success: false,
               error: true,
               message: `Error while removing the group join request. ${groupDeleteInviteResponse}`
           });
           return;
        }	     
     }

     if(is_approved === 1){
        message = `Your request to join the group "${group[1].group_name}" has been approved.`;
        const [ok, groupUpdate] = await updateGroupUserMembership(recipient_reference_number,group_reference_number,{ joined_at: new Date(),is_active: 1 });
        if(!ok){
           res.status(400).json({
               success: false,
               error: true,
               message: `Error while approving the group join request. ${groupUpdate}`
           });
          return;
        }
     }

     const payload = {
        title: title,
        message: message,
        image_url: null,
        users: [inviteeDetail.email],
        notification_for: "2"
     };

     //send a notification.
     await sendInAppNotification(payload);	  

     res.status(200).json({
         success: true,
         error: false,
         message: message
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

module.exports.ImportGroupMembersAsInvites = async(req,res) => {
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

     const admin = await isGroupAdmin(reference_number);
     if(!admin[0]){
        res.status(403).json({
            success: false,
            error: true,
            message: "Unauthorized"
        });
        return;
     }
     res.status(200).json({
         success: true,
	 error: false,
	 message: "Import was successful"    
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

module.exports.ReportUser = async(req,res) => {
  const { email, reference_number, group_reference_number, member_reference_number, reason } = req.body;
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

     const [success,memberStatus] = await findGroupUserMemberShipCount(member_reference_number,group_reference_number);
     if(success && memberStatus.is_member === 0){
        res.status(400).json({
            success: false,
            error: true,
            message: "The user is not a member of the group."
        });
        return;
     }	  

     const userDetail = await getUserDetailByReferenceNumber(reference_number);	  
     const targetDetail = await getUserDetailByReferenceNumber(member_reference_number);

     const payload = { 
	group_id: group[1].group_id, 
	group_reference_number, 
	reported_user_id: targetDetail?._id, 
	reported_reference_number: member_reference_number,
	reported_username: targetDetail?.display_name,     
	reported_profile_picture_url: targetDetail.profile_picture_url,     
	reporter_user_id: userDetail?._id, 
	reporter_reference_number: reference_number, 
	reason 
     };
      
     const response = await reportGroupMember(payload);
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
         message: 'Your report has been received'
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

module.exports.AdminReportedUserList = async(req,res) => {
  const { email, reference_number, group_reference_number, page, limit } = req.body;
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

     const admin = await isGroupAdmin(reference_number);
     if(!admin[0]){
        res.status(403).json({
            success: false,
            error: true,
            message: "Unauthorized"
        });
        return;
     }

     const response = await getReportedGroupMembers(group_reference_number,page,limit);
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
	 data: response[1].data,    
         message: 'Reported user list.'
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

module.exports.ReviewReportedGroupMembers = async(req,res) => {
  const { email, reference_number, review_status, report_id } = req.body; 
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

     const [ok,response] = await reviewReportedGroupMember(reference_number,report_id,review_status);	  
     if(!ok){
        res.status(400).json({
            success: false,
            error: true,
            message: response
        });
        return;
     }	  

     res.status(200).json({
         success: false,
         error: true,
         message: response
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
