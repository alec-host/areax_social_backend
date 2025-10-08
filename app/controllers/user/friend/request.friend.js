const { db2 } = require("../../../models");
const Friends = db2.friends;

//const sequelize = require("../../../db/db2");
//const { Sequelize,QueryTypes } = require("sequelize");

module.exports.makeConnectionRequest = async(data) => {	
  try{    
     const exist = await Friends.findOne({
	where: {
           user_id: data?.user_id,
	   reference_number: data?.reference_number,
           friend_id: data?.friend_id,
           friend_reference_number: data?.friend_reference_number
	}
     });

     if(exist){
        return [false,'You’ve already sent a connection request.'];
     }	  
    	  
     const newFriendRequest = Friends.create({
        user_id: data?.user_id,
        email: data?.email,
        reference_number: data?.reference_number,
        friend_id: data?.friend_id,
        friend_reference_number: data?.friend_reference_number,
        friend_name: data?.friend_name,
        friend_caption: data?.friend_caption,	    
        friend_profile_picture_url: data?.friend_profile_picture_url,
        status: data.status,
	friend_category: data.friend_category,
        created_at: new Date().toISOString().slice(0, 19).replace("T", " "),	    
     });
 
    return [true,'success'];
  }catch(error){
    console.error('Error creating connection request:', error.message);
    return [false,`Error creating connection request: ${error.message}`];
  }
};
