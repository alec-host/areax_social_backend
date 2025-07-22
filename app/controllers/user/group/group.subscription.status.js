const { db2 } = require("../../../models");

const Subscriptions = db2.groups.subscriptions;

module.exports.groupSubscriptionStatus = async(user_email,user_reference_number,group_id) => {
  try {
    const subscription = await Subscriptions.findOne({ where: { user_email,user_reference_number,group_id,status:'active' }});

    return [true, subscription];
  } catch (error) {
    console.error('Error fetching user subscription:', error.message);
    return [false, error.message];
  }
};
