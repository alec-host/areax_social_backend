const { db } = require("../../models");

const Users = db.users;

module.exports.findUserCountByReferenceNumber = async(referenceNumber) => {
    const count = await Users.count({where:{reference_number:referenceNumber}});
    return count;
};
