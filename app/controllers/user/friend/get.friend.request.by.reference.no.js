const { db2 } = require("../../../models");

const FriendRequests = db2.queued_friends_requests;

module.exports.getFriendRequestByReferenceNumber = async(referenceNumber) => {
    return new Promise((resolve, reject) => {
        FriendRequests.findOne({
            attributes: ['_id','originator_reference_number','originator_name','originator_caption','originator_profile_picture_url','created_at'],
            where:{reference_number:referenceNumber}}).then((data) => {
            if(data){
                const _id = data?._id;
                const originator_reference_number = data?.originator_reference_number;
                const originator_name = data?.originator_name;
                const originator_caption = data?.originator_caption;
                const originator_profile_picture_url = data?.originator_profile_picture_url;
                const created_at = data?.created_at;

                resolve([true,{ originator_reference_number, originator_name, originator_caption, originator_profile_picture_url, created_at  }]);
	    }else{
                resolve([false,'No record found.']);
	    }
        }).catch(e => {
            console.error(e);
	    const error_response = e?.message || e?.response || e?.response?.message || 'something wrong has happened'	
            resolve([false,e?.message]);
        });
    });
};
