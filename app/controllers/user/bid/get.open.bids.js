const { db2 } = require("../../../models");

const Bids = db2.bids;
const Wall = db2.wall;

module.exports.getOpenBids = async (post_id) => {
  try {
    const openBids = await Bids.findAll({
      where: {
         post_id: post_id,
      },
      include: {
         model: Wall,
	 where: {
            bid_type: 'open',
            is_public: 1,
 	 }      
      },
      attributes: ['bid_id', 'post_id', 'bid_amount', 'created_at', 'user_id'],
    });

    return [true, openBids];
  } catch (error) {
    console.error('Error fetching open bids:', error.message);
    return [false, error.message];
  }
};
