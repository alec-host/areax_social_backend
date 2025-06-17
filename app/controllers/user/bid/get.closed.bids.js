const { db2 } = require("../../../models");

const Bids = db2.bids;
const Wall = db2.wall;

module.exports.getClosedBids = async (post_id) => {
  try {
    const closedBids = await Bids.findAll({
      where: {
        post_id: post_id,
      },
      includes: {
         model: Wall,
	 where: {
            bid_type: 'closed',
            close_time: {
               [Sequelize.Op.gt]: new Date(),
            },            		 
	 },     
      },	    
      attributes: ['bid_id', 'post_id', 'bid_amount', 'created_at', 'reference_number', 'bidder_email'], // Show relevant details
    });

    return [true, closedBids];
  } catch (error) {
    console.error('Error fetching closed bids:', error.message);
    return [false, error.message];
  }
};
