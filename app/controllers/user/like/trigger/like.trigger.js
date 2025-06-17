//const { db2 } = require("../../../../models");

//const sequelize = require("../../../../db/db2");

module.exports.CreateLikeTrigger = async(sequelize) => {
    try{	
       await sequelize.query(`DROP TRIGGER IF EXISTS after_like_insert;`);
       await sequelize.query(`DROP TRIGGER IF EXISTS after_like_delete;`);

       //await sequelize.query('DELIMITER $$');

       const triggerSQL_1 = `
         CREATE TRIGGER after_like_insert
         AFTER INSERT ON tbl_areax_likes
         FOR EACH ROW
         BEGIN
            INSERT INTO tbl_areax_materialized_metric(post_id, total_likes, total_comments)
            VALUES (NEW.post_id, 1, 0)
            ON DUPLICATE KEY UPDATE total_likes = total_likes + 1;
         END;
       `;

       const triggerSQL_2 = `
         CREATE TRIGGER after_like_delete
         AFTER DELETE ON tbl_areax_likes
         FOR EACH ROW
         BEGIN
            UPDATE tbl_areax_materialized_metric
            SET total_likes = total_likes - 1
            WHERE post_id = OLD.post_id;
         END;
       `;

       await sequelize.query(triggerSQL_1);
       await sequelize.query(triggerSQL_2);	   

       //await sequelize.query('DELIMITER ;');	    
    }catch(error){
       console.error('TRIGGER CREATION ERROR',error);	    
    }finally{
       //await sequelize.close();
    }
};
