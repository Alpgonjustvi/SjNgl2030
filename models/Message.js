  const mongoose = require('mongoose');

  const messageSchema = new mongoose.Schema({
    ngl: {
      type: String,
      required: true,
    },
    fingerprint: {
      type: String ///////////REQUIRE !
    },
    event: {
      type: String
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    }
  });

  module.exports = mongoose.model('Message', messageSchema);

