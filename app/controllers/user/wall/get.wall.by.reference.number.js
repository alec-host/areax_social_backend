const { db2 } = require("../../../models");

const Wall = db2.wall;

module.exports.getWallRecordsByReferenceNumber = async (reference_number, page, limit) => {
  if(page<=0){page=1;}	
  const offset = (page - 1) * limit;
  try {
    const records = await Wall.findAndCountAll({
      where: {
        reference_number: reference_number,
        is_deleted: 0,
      },
      limit: limit,
      offset: offset,
      order: [['created_at', 'DESC']],
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
