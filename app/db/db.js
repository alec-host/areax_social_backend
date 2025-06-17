const Sequelize = require("sequelize");
const { DATABASE_NAME, DATABASE_USER, DATABASE_PASS, DATABASE_HOST } = require("../constants/app_constants");

const sequelize = new Sequelize(
   DATABASE_NAME,
   DATABASE_USER,
   DATABASE_PASS,
    {
      host: DATABASE_HOST,
      dialect: 'mysql',
      pool: {
         max: 10,
         min: 0,
         acquire: 30000,
         idle: 10000
      }
    }
);

sequelize.authenticate().then(() => {
   console.log('Connection1: was successful.');
}).catch((error) => {
   console.error('Unable to connect to the database 1: ', error);
});

module.exports = sequelize;
