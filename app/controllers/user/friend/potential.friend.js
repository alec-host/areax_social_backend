const { db } = require("../../../models");
const { Sequelize } = require("sequelize");
const Users = db.users;

module.exports.getPotentialFriends = async(callBack) => {
    const _list = 20;	
    await Users.findAll({
	attributes: ['_id','reference_number','username','display_name','profile_picture_url','caption'],
        where: {email_verified:1,is_deleted:0},
        order: Sequelize.literal('RAND()'),	    
        limit: _list,}).then((data) => {
        callBack(data);
    }).catch(e => {
        console.error(e);
        callBack(null);
    });
};
