const cors = require("cors");
const morgan = require("morgan");
const express = require('express');
const bodyParser = require('body-parser');
const rateLimit = require("express-rate-limit");

const { db2 } = require("../models");

const { APP_SERVER_PORT } = require("../constants/app_constants");

const app = express();
const PORT = APP_SERVER_PORT;

console.log(PORT);

app.use(cors());

//-.trust first proxy.
app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

app.use("/social/api/v1", limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(morgan('tiny'));

db2.sequelize.sync()
  .then(() => {
   console.log("Synced db.");
})
  .catch((err) => {
   console.log("Failed to sync db: " + err.message);
});

console.log('Resolved path:', require.resolve('../routes/app.routes'));
require("../routes/app.routes")(app);

module.exports = {
   app,
   PORT
};
