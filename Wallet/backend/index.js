const express = require("express");
const app = express();
const cors = require("cors");
const routes = require("./src/routes/routes");
const { dbConnect } = require("./src/config/dbConnect");
require("dotenv").config();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/", routes);

dbConnect();

app.listen(port, () => {
  console.log(`Listening for API Calls on port ${port}`);
});
