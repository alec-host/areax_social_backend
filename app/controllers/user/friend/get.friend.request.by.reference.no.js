const { db2 } = require("../../../models");

const { getUserDetailByReferenceNumber } = require("../../user/get.user.details");

const FriendRequests = db2.queued_friends_requests;

module.exports.getFriendRequestByReferenceNumber = async(referenceNumber) => {
  try{
     const requests = await FriendRequests.findAll({
        attributes: ['_id','originator_reference_number','originator_name','originator_caption','originator_profile_picture_url','created_at'],
	//where:{originator_reference_number:referenceNumber}     
        where:{reference_number:referenceNumber}
     });

     if(!requests || requests.length === 0){
        return [false, 'No record found.'];
     }
	  
     const formattedResults = requests.map((data) => ({
        originator_reference_number: data.originator_reference_number,
        originator_name: data.originator_name,
        originator_caption: data.originator_caption,
        originator_profile_picture_url: data.originator_profile_picture_url || null,
        created_at: data.created_at
     })); 

     return [true, formattedResults];
   }catch(e){
      console.error(e);
      const error_response = e?.message || e?.response || e?.response?.message || 'something wrong has happened'
      return [false,error_response];
   };
};

module.exports.getConnectionRequestorReferenceNumber = async(referenceNumber) => {
  try{ 
     const requests = await FriendRequests.findAll({
        attributes: ['reference_number'],
	//where:{reference_number:referenceNumber}     
        where:{originator_reference_number:referenceNumber}
     });

     if(!requests || requests.length === 0) {
        return [false, 'No record found.'];
     }

     const referenceNumbers = requests.map(req => req.reference_number);

     const userDetailsArray = await Promise.all(
        referenceNumbers.map(async (refNum) => {
           const userDetails = await getUserDetailByReferenceNumber(refNum);
           return {
              recipient_reference_number: refNum,
              recipient_name: userDetails.display_name,
              recipient_caption: userDetails.caption,
              recipient_profile_picture_url: userDetails.profile_picture_url || null,
              created_at: userDetails.created_at,
           };
        })
     );

     return [true, userDetailsArray];	  
  }catch(e){
     const error_response = e?.message || e?.response || e?.response?.message || 'something wrong has happened'
     return [false,error_response];     
  }
};
