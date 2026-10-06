const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const dbConnect = require('./lib/dbConnect');

dotenv.config();

const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Connect DB before every request
app.use(async (req, res, next) => {
  try {
    await dbConnect();
    next();
  } catch (err) {
    console.error('DB connect error:', err.message);
    res.status(500).json({ message: 'Database connection failed', error: err.message });
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'SpendWise API is running.' });
});

// Debug route — check env vars are loaded correctly
app.get('/debug', (req, res) => {
  const uri = process.env.MONGO_URI;
  res.json({
    hasMongoUri: !!uri,
    uriPreview: uri ? uri.substring(0, 25) + '...' : 'NOT SET',
    nodeEnv: process.env.NODE_ENV || 'not set',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Local dev only
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  dbConnect()
    .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
    .catch((err) => { console.error(err); process.exit(1); });
}

module.exports = app;
