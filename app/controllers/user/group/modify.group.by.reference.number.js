const { db2 } = require("../../../models");

const Groups = db2.groups;

module.exports.modifyGroupByReferenceNumber = async(group_reference_number,payload) => {
    const isUpdated = await Groups.update(payload,{ where:{ group_reference_number:group_reference_number }}).catch(e => { return false; });
    if(!isUpdated){
        return false;
    }
    return true;
};
