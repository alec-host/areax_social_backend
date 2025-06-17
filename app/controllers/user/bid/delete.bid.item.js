const { db2 } = require("../../../models");

const Wall = db2.wall;

const deleteBidItem = async (data,reference_number) => {
  try {
      const deletedRows = await Wall.destroy(
          {
              where: {
                  reference_number: reference_number
              },
          }
      );
      if(deletedRows > 0){
          return [true,'Bid post deleted successfully.'];
      }else{
          return [false,'No record found'];
      }
      return [true,newPost];
  } catch (error) {
      console.error('Error saving show-wall post:', error.message);
      return [false,error.message];
  }
};

