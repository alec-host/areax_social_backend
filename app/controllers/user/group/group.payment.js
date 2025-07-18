const { db2 } = require("../../../models");

const Payments = db2.groups.payments;

module.exports.groupPayment = async(user_email,user_reference_number,group_id) => {
  try {
    const payment = await Payments.findOne({ where: { user_email,user_reference_number,group_id }});

    return [true, payment];
  } catch (error) {
    console.error('Error fetching user payment:', error.message);
    return [false, error.message];
  }
};
