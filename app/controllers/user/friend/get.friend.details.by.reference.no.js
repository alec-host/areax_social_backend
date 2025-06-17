const { db2 } = require("../../../models");

const Friends = db2.friends;

module.exports.getFriendDetailsByReferenceNumber = async(referenceNumber) => {
    return new Promise((resolve, reject) => {
        Friends.findOne({
	    attributes: ['_id','email','reference_number','friend_id','friend_reference_number','friend_name','friend_caption','friend_profile_picture_url','friend_category'], 
	    where:{friend_reference_number:referenceNumber}}).then((data) => {

            const _id = data._id;
            const email = data.email;
            const reference_number = data.reference_number;
            const friend_id = data.friend_id;
	    const friend_reference_number = data.friend_reference_number;
            const friend_name = data.friend_name;
            const friend_caption = data.friend_caption;
	    const friend_profile_picture_url = data.friend_profile_picture_url
            const friend_category = data.friend_category;

            resolve({ _id, email, reference_number, friend_id, friend_reference_number, friend_name, friend_caption, friend_profile_picture_url, friend_category });
        }).catch(e => {
            console.error(e);
            resolve(null);
        });
    });
};
