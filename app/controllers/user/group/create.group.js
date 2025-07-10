const { db2 } = require("../../../models");

const ChatGroups = db2.groups;
const GroupMembers = db2.members;

module.exports.createGroup = async (groupData) => {
  try {
    let payload;
    if(groupData.group_type === 'open'){
       payload = {
          admin_id: groupData.admin_id,
          admin_reference_number: groupData.admin_reference_number,
          group_name: groupData.group_name,
          description: groupData.description,
          group_type: groupData.group_type,
          background_image: groupData.background_image || null,
          payment_required: groupData.payment_required,
          invite_link: groupData.invite_link,
          max_members: groupData.max_members
       }
    }
    payload = {
       admin_id: groupData.admin_id,
       admin_reference_number: groupData.admin_reference_number,
       group_name: groupData.group_name,
       description: groupData.description,
       group_type: groupData.group_type,
       background_image: groupData.background_image || null,
       payment_required: groupData.payment_required,
       price_amount: groupData.price_amount,
       price_currency: groupData.price_currency,
       subscription_interval: groupData.subscription_interval,
       invite_link: groupData.invite_link,
       max_members: groupData.max_members
    };

    const newGroup = await ChatGroups.create(payload);

    // Automatically add creator as a member with 'admin' role
    await GroupMembers.create({
      group_id: newGroup.group_id,
      user_id: groupData.admin_id,
      reference_number: groupData.admin_reference_number,
      role: 'admin'
    });

    return [true, newGroup];
  } catch (error) {
    console.error('Error creating group:', error.message);
    return [false, error.message];
  }
};
