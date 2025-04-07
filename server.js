require('dotenv').config(); // This line is important
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const app = express();

const authRouter = require('./auth-backend/routes/auth'); // Make sure the path is correct

app.use(cors());
app.use(express.json());
app.use('/api', authRouter);


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

  mongoose.connection.on('connected', () => {
    console.log('✅ Mongoose connection is OPEN');
  });
  
  mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err);
  });
  
  mongoose.connection.on('disconnected', () => {
    console.log('⚠️ Mongoose disconnected');
  });
  

  const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
