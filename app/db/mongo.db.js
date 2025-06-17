const mongoose = require("mongoose");
const { MONGO_USER, MONGO_PASS, MONGO_PORT, MONGO_DATABASE_NAME } = require("../constants/app_constants");

mongoose.set('debug', true);
module.exports.mongoDb = async() => {
    try{
        const connection = await mongoose.connect(`mongodb://${MONGO_USER}:${MONGO_PASS}@localhost:${MONGO_PORT}/${MONGO_DATABASE_NAME}`, {
            dbName: MONGO_DATABASE_NAME,
        });

        console.log(`MongoDB Connected: ${connection}`);
        return connection;
    }catch(error){
        console.error(`Error connecting to MongoDB: ${err.message}`);
        return null;
    }
};
