const { db2 } = require("../../../models");

const GroupMembers = db2.members;

module.exports.fetchProfilePictures = async(groupReferenceNumber) => {
  try{
      const results = await GroupMembers.findAll({
         attributes: ['profile_picture_url'],
         where: {
            group_reference_number: groupReferenceNumber,
         },
         limit: 4,
      });

      const urls = results.map(row => row.profile_picture_url);
      console.log(urls);
      return urls;
  }catch(err){
      console.error('Error fetching profile pictures:', err);
      return [];
  }
}
