const { Op } = require('sequelize');

const { db } = require("../../models");

const Users = db.users;

module.exports.searchUserByUsernameLocation = async(searchQuery) => {
   try{
      const users = await Users.findAll({
         where: {
            is_deleted: 0,
            email_verified: 1,
            [Op.or]: [
               { username: { [Op.like]: `%${searchQuery}%`} },
               { display_name: { [Op.like]: `%${searchQuery}%` } },
               { email: { [Op.like]: `%${searchQuery}%` } }
            ],
	 },
         attributes: ['username', 'display_name', 'profile_picture_url', 'reference_number'],
         limit: 20
      });

      if(!users || users.length === 0){
         return null;
      }

      return users.map(user => ({
         username: user.username || user.display_name,
         profile_picture_url: user.profile_picture_url,
         reference_number: user.reference_number
      }));
   }catch(error){
      console.error('Error while searching for a user: ',error.message);
      return null;
   }
};
