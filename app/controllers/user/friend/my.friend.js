const { db2 } = require("../../../models");
const { Sequelize } = require("sequelize");
const Friends = db2.friends;

module.exports.getMyFriendListByReferenceNumber = async(reference_number,friend_category,callBack) => {
    const _limit = 100;	
    const _friendShipStatus = 'accepted';	
    //---'pending', 'accepted', 'blocked', 'unfriended'
    await Friends.findAll({
        attributes: ['_id','email','reference_number','friend_id','friend_reference_number','friend_name','friend_caption','friend_profile_picture_url','friend_category'],
        where: {reference_number:reference_number,/*friend_category:friend_category,*/status:_friendShipStatus},
        limit: _limit,}).then((data) => {	
        callBack(data);
    }).catch(e => {
        console.error(e);
        callBack(null);
    });
};
