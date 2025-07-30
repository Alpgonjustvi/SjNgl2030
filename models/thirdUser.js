const mongoose = require("mongoose");

const thirdUserSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  blocked: {
    type: Boolean,
    default: false
  },
  block_purpose: {
    type: String,
    default: ""
  }
});

module.exports = mongoose.model("ThirdUser", thirdUserSchema);
