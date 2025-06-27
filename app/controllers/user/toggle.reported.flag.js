const { db2 } = require("../../models");

const Wall = db2.wall;

module.exports.isReportedFlag = async(payload) => {
    console.log(payload);
    const email = payload.email;
    const post_id = payload.post_id;
    const is_flagged = payload.flag;
    const reference_number = payload.reference_number;
    try{
       const [isUpdated] = await Wall.update({ is_flagged:is_flagged },{ where:{ post_id } });
       if(isUpdated === 0){
          return false;
       }
       return true;
    }catch(error){
       console.log('ERROR: ', error?.message);
       return false;
    }
};
