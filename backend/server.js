const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Health check — root route
app.get('/', (req, res) => {
  res.json({ message: 'SpendWise API is running.' });
});

// Connect to MongoDB then load routes
const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
};

// Routes — loaded after DB connection attempt
app.use('/api/auth', async (req, res, next) => {
  try {
    await connectDB();
    const authRoutes = require('./routes/auth');
    authRoutes(req, res, next);
  } catch (err) {
    res.status(500).json({ message: 'Database connection failed', error: err.message });
  }
});

app.use('/api/expenses', async (req, res, next) => {
  try {
    await connectDB();
    const expenseRoutes = require('./routes/expenses');
    expenseRoutes(req, res, next);
  } catch (err) {
    res.status(500).json({ message: 'Database connection failed', error: err.message });
  }
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => {
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err.message);
      process.exit(1);
    });
}

module.exports = app;
