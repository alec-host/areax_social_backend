const { db2 } = require("../../../models");
const { Op, Sequelize } = require("sequelize");

const Friends = db2.friends;

module.exports.deleteInitatorRequest = async(reference_number,friend_reference_number) => {
  try {
    const result = await Friends.destroy({ where:{[Op.and]:[{reference_number:reference_number},{friend_reference_number:friend_reference_number}],status:'pending'} });
    if(result === 0){
        return [false,'There are currently no pending connection requests.'];
    }else{
        return [true,'The connection request has been deleted.'];
    }
  } catch (error) {
    console.error('Failed to delete a record:', error.message);
    return [false,`Failed to delete a record: ${error.message}`];
  }
};
