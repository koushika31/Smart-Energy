 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const energyRoute = require('./routes/energyRoute');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/energy', energyRoute);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected ✅'))
  .catch((err) => console.error(err));

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
