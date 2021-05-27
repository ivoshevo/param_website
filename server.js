const express = require("express");
const mongoose = require("mongoose");
const compression = require("compression");
const helmet = require("helmet");
const Route = require("./routers/main");

const app = express();

require("dotenv").config();
compression();
helmet();

mongoose.Promise = global.Promise;
async function dbConect() {
  try {
    const dbConnection = await mongoose.connect(process.env.DB_Local, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    if (dbConnection) {
      console.log("Data Base Connected");
      const port = process.env.PORT || 4000;
      app.listen(port, () => console.log(`Server running on port: ${port}`));
    }
  } catch (err) {
    console.log(err);
  }
}

dbConect();

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.use("/", Route);
