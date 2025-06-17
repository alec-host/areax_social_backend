const { db } = require("../../models");

const Users = db.users;

module.exports.getUserProfilePrivacyStatus = async(reference_number) => {	
    return new Promise((resolve, reject) => {
        Users.findOne({attributes: ['privacy_status'], where:{ reference_number:reference_number }}).then((data) => {
            const privacy_status = data.privacy_status;
            resolve({ privacy_status });
        }).catch(e => {
            console.error(e);
            resolve(null);
        });
    });
};
