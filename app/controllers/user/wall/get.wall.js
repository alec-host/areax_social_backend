const { Op } = require('sequelize');

const { db2 } = require("../../../models");

const Wall = db2.wall;

module.exports.getWallRecords = async (post_type,is_public='everyone',cursor=null,page=1,limit=20) => {
  limit = Math.min(parseInt(limit) || 20, 100);	
  if(page<=0){page=1;}	
  const offset = (page - 1) * limit;
  	
  try {

    const whereClause = {
       post_type,
       group_reference_number: null,
       is_public,
       is_deleted: 0
    };

    if(cursor){
       whereClause.created_at = { [Op.lt]: new Date(cursor) };
    }	  
	  
    const result = await Wall.findAndCountAll({
      where: whereClause,	    
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      raw: true	    
    });

    const rows = result.rows || [];
    const nextCursor = rows.length > 0 ? rows[rows.length - 1].created_at : null;
	  
    return [true,{
       data: rows,
       total: cursor ? undefined : result.count,
       nextCursor,
       currentPage: cursor ? null : page,
       totalPages: cursor ? null : Math.ceil(result.count / limit),
       hasMore: rows.length === limit	    
    }];
  } catch(error) {
    console.error('Error fetching paginated records:', error);
    return [false,error];
  }
};
