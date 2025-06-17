const { db2 } = require("../../../models");

const Bids = db2.bids;

const declineBid = async (data,reference_number) => {
  try {
     const [updatedRow] = await Bids.update(
         {
             ...data
         },
         {
             where: {
                reference_number: reference_number
             },
         }
     );
     if(updatedRow){
        return [true,'Record updated successfully.'];
     }else{
        return [false,'No record found'];
     }
     return [true,newPost];
  } catch (error) {
     console.error('Error when bid is declined:', error.message);
     return [false,error.message];
  }
};
