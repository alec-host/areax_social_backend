const { db2 } = require("../../../models");
const { Sequelize } = require("sequelize");

const Friends = db2.friends;

module.exports.getFriendListByReferenceNumber = async(reference_number,callBack) => {
    await Friends.findAll({
        attributes: ['_id','email','reference_number','friend_id','friend_reference_number','friend_name','friend_caption','friend_profile_picture_url','friend_category'],
        where: { reference_number:reference_number }}).then((data) => {
        callBack(data);
    }).catch(e => {
        console.error(e);
        callBack([]);
    });
};
