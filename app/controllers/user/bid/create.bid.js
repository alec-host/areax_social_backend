const { db2 } = require("../../../models");

const Bids = db2.bids;

module.exports.createBid = async (bidData) => {
  try {
    const newBid = await Bids.create({
      post_id: bidData.post_id,
      user_id: bidData.user_id,
      reference_number: bidData.reference_number || null,
      bidder_email: bidData.bidder_email || null,
      bid_amount: bidData.bid_amount,
      bid_type: bidData.bid_type, // 'open' or 'closed'
      visibility: bidData.bid_type === 'open', // Open bids are visible to all    
    });

    return [true, newBid];
  } catch (error) {
    console.error('Error creating bid:', error.message);
    return [false, error.message];
  }
};
