const { db2 } = require("../../../models");
const { Op, Sequelize } = require("sequelize");

const FriendRequests = db2.queued_friends_requests;

module.exports.deleteFriendRequest = async(reference_number,originator_reference_number) => {
  try {
    const result = await FriendRequests.destroy({ where:{[Op.and]:[{reference_number:reference_number},{originator_reference_number:originator_reference_number}]} });
    if(result === 0){
        return [false,'No matching record found.'];
    }else{
        return [true,'Record deleted.'];
    }
  } catch (error) {
    console.error('Failed to delete a record:', error.message);
    return [false,`Failed to delete a record: ${error.message}`];
  }
};
