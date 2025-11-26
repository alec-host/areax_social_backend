const { Op } = require('sequelize');
const { db2 } = require("../../../models");

const Wall = db2.wall;
const Collection = db2.collections;

module.exports.getSavedWallRecords = async (post_type,reference_number,hashtag,collection_reference_number=null,is_public='everyone',cursor=null,page=1,limit=20) => {
  limit = Math.min(parseInt(limit) || 20, 100); // Cap limit

  if(page<=0){page=1;}
  const offset = (page - 1) * limit;

  const collection = await Collection.findOne({
     where: {  creator_reference_number: reference_number },
     attributes: ['collection_reference_number'],
     raw: true
  });

  
  const whereClause = collection_reference_number ? {
    post_type,
    group_reference_number: null,	  
    is_public, 
    is_deleted: 0,  
    collection_reference_number,	  
  }:
  {
    post_type,
    group_reference_number: null,
    /*collection_reference_number: null, */	  
    is_public,
    is_deleted: 0,
  };	
  
  if(cursor){
     whereClause.created_at = { [Op.lt]: new Date(cursor) };
  }

  try {
    const result = await Wall.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      //offset: cursor ? undefined : offset,
      offset: parseInt(offset),	    
      order: [['created_at', 'DESC']],
      raw: true
    });

    const rows = result.rows || [];
    const nextCursor = rows.length > 0 ? rows[rows.length - 1].created_at : null;
    ///console.log('TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT ',result.count);
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
