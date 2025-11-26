const { Op } = require('sequelize');
const { db2 } = require("../../../models");

const Wall = db2.wall;

module.exports.getWallHashtagRecords = async (post_type,hashtag,is_public='everyone',cursor=null,page=1,limit=20) => {
  limit = Math.min(parseInt(limit) || 20, 100); // Cap limit	
  if(page<=0){page=1;}
  const offset = (page - 1) * limit;

  const whereClause = {
    post_type: post_type,
    group_reference_number: null,
    description:{
      [Op.like]: `%#${hashtag}%` // Searches for hashtag within description
    },
    is_public: is_public,
    is_deleted: 0,
  };	

  if(cursor){
     whereClause.created_at = { [Op.lt]: new Date(cursor) };
  }	

  try {
    const result = await Wall.findAndCountAll({
      where: whereClause,
      limit,
      offset: cursor ? undefined : offset,
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
    console.error('Error fetching paginated hashtag records with infinite scroll support:', error);
    return [false,error?.message];
  }
};
