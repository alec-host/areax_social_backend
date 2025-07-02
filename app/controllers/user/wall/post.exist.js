const { db2 } = require("../../../models");

const Wall = db2.wall;


module.exports.getPostCountById = async(postId) => {
    const count = await Wall.count({where:{post_id:postId}});
    return count;
};
