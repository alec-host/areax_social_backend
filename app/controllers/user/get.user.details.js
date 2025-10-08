const { db } = require("../../models");

const Users = db.users;

module.exports.getUserDetailByReferenceNumber = async(referenceNumber) => {
    return new Promise((resolve, reject) => {
        Users.findOne({attributes: ['_id','display_name','username','email','caption','profile_picture_url','privacy_status'], where:{reference_number:referenceNumber},raw: true}).then((data) => {
            if(data){		
               const _id = data?._id;
               const display_name = data?.display_name || data?.username;
	       const caption = data?.caption;
	       const email = data?.email;
	       const profile_picture_url = data?.profile_picture_url;
	       const privacy_status = data?.privacy_status;	    
               resolve({ _id, display_name, email, caption, profile_picture_url, privacy_status });
	    }else{
               resolve(null);
	    }
        }).catch(e => {
            console.error(e);
            resolve(null);
        });
    });	
};
