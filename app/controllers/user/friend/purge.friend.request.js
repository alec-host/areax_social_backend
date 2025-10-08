const { db2 } = require("../../../models");
const { Op, Sequelize } = require("sequelize");

const FriendRequests = db2.queued_friends_requests;

module.exports.deleteConnectionRequest = async(reference_number,originator_reference_number) => {
  try {
    const result = await FriendRequests.destroy({ where:{[Op.and]:[{reference_number:reference_number},{originator_reference_number:originator_reference_number}]} });
    if(result === 0){
        return [false,'There are currently no pending connection requests for this user.'];
    }else{
        return [true,'The connection request has been successfully accepted.'];
    }
  } catch (error) {
    console.error('Failed to delete a record:', error.message);
    return [false,`Failed to delete a record: ${error.message}`];
  }
};
