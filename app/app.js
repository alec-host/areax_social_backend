const { app, PORT } = require("./config/app.config");

app.listen(PORT, async() => {
  console.log(`Server listening on ${PORT}`);
});
