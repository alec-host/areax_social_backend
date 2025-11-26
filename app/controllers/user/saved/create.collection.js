const { db2, sequelize2 } = require("../../../models");

const Collections = db2.collections;
//const Wall = db2.wall;

module.exports.createCollection = async (data) => {
  //const transaction = await sequelize2.transaction();	
  try {
    const newCollection = await Collections.create({
      name: data.name,	  
      /*post_id: data.post_id,*/	    
      collection_reference_number: data.collection_reference_number,
      is_shared: data.is_shared,
      creator_reference_number: data.creator_reference_number,
      creator_name: data.creator_name,
      profile_picture_url: data.profile_picture_url,
      created_at: new Date().toISOString()   
    },);

    if(!newCollection || !newCollection.collection_reference_number) {
       //await transaction.rollback();
       return [false, 'Collection creation failed or missing reference number'];
    }
    /*
    await Wall.update(
      { collection_reference_number: newCollection.collection_reference_number },	    
      { where: { post_id: data.post_id }, transaction }
    );	    	  
    */
    //await transaction.commit();	  
    return [true,newCollection];
  } catch (error) {
    //await transaction.rollback();	  
    console.error('Error creating a collection:', error.message);
    return [false,error.message];
  }
};
