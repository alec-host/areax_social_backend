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

module.exports.makeUserAsInnerCircle = async(payload) => {
    try{
       const [updateRows] = await Friends.update(
         {close_friend_tag:payload.close_friend_tag},
         {
            where: {
                reference_number: payload.reference_number,
                friend_reference_number: payload.friend_reference_number,
            },
         }
       );
       if(updateRows > 0){
          return [true,`Successfully tagged user as an '${payload.close_friend_tag}'.`];
       }else{
          return [false,'No matching record found'];
       }
    }catch(err){
       console.error('Error: ', err.message);
       return [false, `Error: ${err.message}`];
    }   
};

module.exports.resetUserAsInnerCircle = async(payload) => {
    try{
       const [updateRows] = await Friends.update(
         {close_friend_tag:payload.close_friend_tag},
         {
            where: {
                reference_number: payload.reference_number,
                friend_reference_number: payload.friend_reference_number,
            },
         }
       );
       if(updateRows > 0){
          return [true,`Successfully untagged user as an inner-circle.`];
       }else{
          return [false,'No matching record found'];
       }
    }catch(err){
       console.error('Error: ', err.message);
       return [false, `Error: ${err.message}`];
    }
};

module.exports.getInnerCircleTag = async(payload) => {
    try{
       const count = await Friends.count(
         {
            where: {
                reference_number: payload.reference_number,
                friend_reference_number: payload.friend_reference_number,
		close_friend_tag: null /*payload.close_friend_tag*/ 
            },
         }
       );
       return count;
    }catch(err){
       console.error('Error: ', err.message);
       return 0;
    }
};
