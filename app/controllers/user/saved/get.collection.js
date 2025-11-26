const { db2,sequelize2 } = require("../../../models");
const { enrichCollectionsWithPosts } = require("./collection.enricher");

const Wall = db2.wall;
const Collections = db2.collections;

module.exports.getCollectionList = async (email,reference_number,page=1,limit=20) => {
  limit = Math.min(parseInt(limit) || 4, 100);
  if(page<=0){page=1;}
  const offset = (page - 1) * limit;	
  try{
      const result = await Collections.findAndCountAll({
         attributes:['collection_id', 'name', 'collection_reference_number', 'creator_reference_number', 'creator_name', 'profile_picture_url', 'created_at', 'is_shared'],
         where:{
            creator_reference_number: reference_number,
         },
         limit: parseInt(limit),
         offset: parseInt(offset),
         order: [['created_at', 'DESC']],	      
         raw: true
      });

      const rows = result.rows || [];	  

      if(rows.length === 0){
         return [false, 'No collection found'];
      }	  
      
      const enrichedRows = await enrichCollectionsWithPosts(rows, { Wall, sequelize: sequelize2 }, { limitPerCollection: 4 });

      return [true,{
         data: enrichedRows,
         total: result.count,
         currentPage: page,
         totalPages: Math.ceil(result.count / limit),
      }];
  }catch(error){
    console.error('Error: fetching collection[s]', error);
    return [false,error?.message];
  }
};
