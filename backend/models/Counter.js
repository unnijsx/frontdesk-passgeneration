const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  seq: {
    type: Number,
    required: true,
    default: 1000
  }
});

module.exports = mongoose.model('Counter', counterSchema);
