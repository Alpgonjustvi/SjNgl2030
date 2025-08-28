const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date, 
    required: true, 
    index: { 
      expires: 0 
    } },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Event', eventSchema);

