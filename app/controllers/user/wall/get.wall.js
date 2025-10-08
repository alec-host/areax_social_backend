const { db2 } = require("../../../models");

const Wall = db2.wall;

module.exports.getWallRecords = async (post_type,is_public='everyone',page=1,limit=10000000000000000) => {	
  if(page<=0){page=1;}	
  const offset = (page - 1) * limit;
  try {
    const records = await Wall.findAndCountAll({
      where: {
	 post_type: post_type,
	 group_reference_number: null,     
	 is_public: is_public,     
	 is_deleted: 0,      
      },	    
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      raw: true	    
    });

    return [true,{
       data: records.rows,
       total: records.count,
       currentPage: page,
       totalPages: Math.ceil(records.count / limit),
    }];
  } catch(error) {
    console.error('Error fetching paginated records:', error);
    return [false,error];
  }
};
