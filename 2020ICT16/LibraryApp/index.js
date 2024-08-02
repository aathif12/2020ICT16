const express = require("express");
const app = new express();
const port = 8080;
const mongoose = require("mongoose");
const libRoute = require("./route/libraryRoute");
const authorRoute = require("./route/authorRoute");
const bookRoute = require("./route/bookRoute");
const userRoute = require("./route/userRoute");
app.use(express.json());
app.use("/user", userRoute);
app.use("/lib", libRoute);
app.use("/author", authorRoute);
app.use("/book", bookRoute);

mongoose
  .connect("mongodb://127.0.0.1:27017/Library")
  .then(() => {
    console.log("DB connected");
  })
  .catch((error) => {
    console.log(error);
  });

app.listen(port, () => {
  console.log("The API is running on a port ", port);
});
