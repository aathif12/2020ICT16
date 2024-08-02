const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const libararySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
});

const Library = mongoose.model("libraries", libararySchema);

module.exports = Library;
