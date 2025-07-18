const { db2 } = require("../../../models");

const Subscriptions = db2.groups.subscriptions;

module.exports.groupSubscription = async(user_email,user_reference_number,group_id) => {
  try {
    const subscription = await Subscriptions.findOne({ where: { user_email,user_reference_number,group_id }});

    return [true, subscription];
  } catch (error) {
    console.error('Error fetching user subscription:', error.message);
    return [false, error.message];
  }
};
