//const { db2 } = require("../../../models");
//const Friends = db2.friends;

const sequelize = require("../../../db/db2");
const { Sequelize,QueryTypes } = require("sequelize");

module.exports.makeFriendRequest = async(data) => {	
  try {	
    /*	  
    const newFriendRequest = Friends.build({
        user_id: data?.user_id,
        email: data?.email || 'not provided',
        reference_number: data?.reference_number,
        friend_id: data?.friend_id,
        friend_reference_number: data?.friend_reference_number,
        friend_name: data?.friend_name,
        friend_caption: data?.friend_caption,	    
        friend_profile_picture_url: data?.friend_profile_picture_url,
        status: 'pending',
        created_at: new Date().toISOString(),	    
    });
    await newFriendRequest.save(); 	  
    */
    await sequelize.query(
          `INSERT INTO tbl_areax_friends 
	   (user_id, email, reference_number, friend_id, friend_reference_number, friend_name, friend_caption, friend_profile_picture_url, status, created_at) 
	   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
         {
            replacements: [
               data?.user_id,
               data?.email,
               data?.reference_number,
               data?.friend_id,
               data?.friend_reference_number,
               data?.friend_name,
               data?.friend_caption,
               data?.friend_profile_picture_url,
               "pending",
	       new Date().toISOString().slice(0, 19).replace("T", " ")	    
           ],
           type: QueryTypes.INSERT
        }
    );	  
    return [true,'success'];
  } catch (error) {
    console.error('Error creating friend request 1111:', error.message);
    return [false,`Error creating friend request: ${error.message}`];
  }
};
