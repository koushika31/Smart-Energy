 
const mongoose = require('mongoose');

const energyDataSchema = new mongoose.Schema({
  solar: [Number],
  wind: [Number],
  usage: [Number],
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EnergyData', energyDataSchema);
