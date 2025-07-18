const cors = require("cors");
const morgan = require("morgan");
const express = require('express');

const { APP_SERVER_PORT } = require("./constants/app_constants");

const app = express();
const PORT = 9724;

app.use(cors());

//-.trust first proxy.
app.set('trust proxy', 1);

app.use(morgan('tiny'));

require("./routes/app.webhook.routes")(app);

app.listen(PORT, () => {
    console.log(`STRIPE WEBHOOK SERVER RUNNING ON PORT: ${PORT}`);
});

app.use('*', (req, res) => {
    res.status(404).json({ success: false, message: "Not found" });
});

