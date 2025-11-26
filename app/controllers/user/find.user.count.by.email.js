const { db } = require("../../models");

const Users = db.users;

module.exports.findUserCountByEmail = async(email) => {
    const count = await Users.count({where:{email:email}});	
    return count;
};
