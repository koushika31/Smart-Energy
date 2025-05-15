 
const express = require('express');
const router = express.Router();
const EnergyData = require('../models/EnergyData');

router.post('/save', async (req, res) => {
  try {
    const newData = new EnergyData(req.body);
    await newData.save();
    res.json({ message: 'Energy data saved successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving data', error: err });
  }
});

router.get('/all', async (req, res) => {
  try {
    const data = await EnergyData.find().sort({ timestamp: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching data', error: err });
  }
});

module.exports = router;
