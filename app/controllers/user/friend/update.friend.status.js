const { db2 } = require("../../../models");
const { Sequelize } = require("sequelize");
const Friends = db2.friends;

module.exports.acceptFriend = async(payload) => {
    try{	
       const [updateRows] = await Friends.update(
	 {status:payload.status},
	 {
	    where: {
                reference_number: payload.friend_reference_number,
		friend_reference_number: payload.reference_number,
		status: 'pending',
	    }, 
	 }
       );
       if(updateRows > 0){
          return [true,`Successfully updated status to '${payload.status}'`];
       }else{
	  return [false,'No matching record found'];     
       }	    
    }catch(err){
       console.error('Error: ', err.message); 
       return [false, `Error: ${err.message}`];	    
    }
};

module.exports.blockFriend = async(payload) => {
    try{
       const [updateRows] = await Friends.update(
         {status:payload.status},
         {
            where: {
                reference_number: payload.reference_number,
                friend_reference_number: payload.friend_reference_number,
                status: 'accepted',
            },
         }
       );
       if(updateRows > 0){
          return [true,`Successfully updated status to '${payload.status}'`];
       }else{
          return [false,'No matching record found'];
       }	    
    }catch(err){
       console.error('Error: ', err.message);
       return [false, `Error: ${err.message}`];	    
    }
};

module.exports.unblockFriend = async(payload) => {
    try{
       const [updateRows] = await Friends.update(
         {status:payload.status},
         {
            where: {
                reference_number: payload.reference_number,
                friend_reference_number: payload.friend_reference_number,
                status: 'blocked',
            },
         }
       );
       if(updateRows > 0){
          return [true,`Successfully updated status to '${payload.status}'`];
       }else{
          return [false,'No matching record found'];
       }
    }catch(err){
       console.error('Error: ', err.message);
       return [false, `Error: ${err.message}`];
    }
};
