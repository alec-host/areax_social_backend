const { db2 } = require("../../../models");
const Comments = db2.comments;

module.exports.editComment = async(payload) => {
    try{
       const [updateRows] = await Comments.update(
         {comment_text:payload.comment_text},
         {
            where: {
                commentor_email: payload.commentor_email,
                commentor_reference_number: payload.commentor_reference_number,
                comment_id: payload.comment_id,
            },
         }
       );
       if(updateRows > 0){
          return [true,`Successfully edited comment to '${payload.comment_id}'`];
       }else{
          return [false,'No matching record found'];
       }
    }catch(err){
       console.error('Error: ', err.message);
       return [false, `Error: ${err.message}`];
    }
};
