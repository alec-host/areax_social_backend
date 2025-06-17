const { db } = require("../../models");

const Users = db.users;

module.exports.changeUserProfileStatus = async(payload) => {
    const isUpdated = await Users.update({ privacy_status:payload.privacy_status:payload },{ where:{email:payload.email,reference_number:payload.reference_number}}).catch(e => { return false; });
    if(!isUpdated){
        return false;
    }
    return true;
};
