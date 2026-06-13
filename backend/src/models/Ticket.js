const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketNo: {
    type: String,
    required: true,
    unique: true
  },
  lineUserId: {
    type: String,
    required: true
  },
  lineDisplayName: {
    type: String,
    required: true
  },
  machineType: {
    type: String,
    required: true
  },
  machineModel: {
    type: String,
    required: true
  },
  branchName: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  googleMapUrl: {
    type: String,
    required: true
  },
  installDate: {
    type: Date,
    required: true
  },
  installTime: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'completed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Ticket', ticketSchema);
