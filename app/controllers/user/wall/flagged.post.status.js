const { db2 } = require("../../../models");

const Wall = db2.wall;

module.exports.getPostFlaggedStatusByPostId = async(post_id) => {
    return new Promise((resolve, reject) => {
        Wall.findOne({attributes:['is_flagged'], where:{ post_id }}).then((data) => {
            const is_flagged = data.is_flagged;
            resolve({ is_flagged });
        }).catch(e => {
            console.error(e);
            resolve(null);
        });
    });
};
