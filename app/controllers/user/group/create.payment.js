const { db2 } = require("../../../models");

const Payments = db2.groups.payments;

module.exports.createGroupPayment = async(payload) => {
  try {
    const newPayment = await Payments.create(payload);
    return [true, newPayment];
  } catch (error) {
    console.error('Error: creating user payment:', error.message);
    return [false, error.message];
  }
};
