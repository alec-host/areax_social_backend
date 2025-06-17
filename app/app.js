const cors = require("cors");
const morgan = require("morgan");
const express = require('express');
const bodyParser = require('body-parser');
const { db2 } = require("./models");
const appRoutes = require('./routes/app.routes');
const error = require('./middleware/error.handler');
const { APP_SERVER_PORT } = require("./constants/app_constants");

const app = express();
const PORT = APP_SERVER_PORT;

app.use(cors());
app.use(express.json());

app.use(morgan('tiny'));

db2.sequelize.sync(/*{ force: false, alter: true }*/)
  .then(() => {
   console.log("Synced db.");
})
  .catch((err) => {
   console.log("Failed to sync db: " + err.message);
});

app.use('/social/api/v1',appRoutes);

app.use(error.errorHandler);

app.listen(PORT, () => {
    console.log(`SOCIAL SERVER RUNNING ON PORT: ${PORT}`);
});
