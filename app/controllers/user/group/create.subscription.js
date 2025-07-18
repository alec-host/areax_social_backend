const { db2 } = require("../../../models");

const Subscriptions = db2.groups.subscriptions;

module.exports.createGroupSubscription = async(payload) => {
  try {
    const newSubscription = await Subscriptions.create(payload);

    return [true, newSubscription];
  } catch (error) {
    console.error('Error: creating user subscription:', error.message);
    return [false, error.message];
  }
};
