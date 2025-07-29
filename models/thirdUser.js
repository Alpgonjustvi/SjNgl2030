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
  }
});

module.exports = mongoose.model("ThirdUser", thirdUserSchema);
