const { db2 } = require("../../../models");

const Payments = db2.groups.payments;

module.exports.groupPaymentStatus = async(user_email,user_reference_number,group_id) => {
  try {
    const payment = await Payments.findOne({ where: { user_email,user_reference_number,group_id,status:'completed' }});

    return [true, payment];
  } catch (error) {
    console.error('Error fetching user payment status:', error.message);
    return [false, error.message];
  }
};
