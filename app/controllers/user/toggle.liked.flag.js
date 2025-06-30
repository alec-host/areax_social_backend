const { db2 } = require("../../models");

const Wall = db2.wall;

module.exports.isLikedFlag = async(payload) => {	
    const _flag = payload.flag;	
    const email = payload.email;	
    const post_id = payload.post_id;	
    const reference_number = payload.reference_number;	
    try{	
       const [isUpdated] = await Wall.update({ is_liked:_flag },{ where:{ post_id } }); 
       if(isUpdated === 0){
          return [false,_flag];
       }
       return [true,_flag];
    }catch(error){
       console.log('ERROR: ', error?.message);	    
       return [false,error?.message];
    }
};
