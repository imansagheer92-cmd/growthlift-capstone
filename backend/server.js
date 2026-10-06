const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const dbConnect = require('./lib/dbConnect');

dotenv.config();

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'SpendWise API is running.' });
});

// Debug
app.get('/debug', (req, res) => {
  const uri = process.env.MONGO_URI;
  res.json({
    hasMongoUri: !!uri,
    uriPreview: uri ? uri.substring(0, 25) + '...' : 'NOT SET',
  });
});

// Ping DB
app.get('/ping', async (req, res) => {
  try {
    await dbConnect();
    res.json({ message: 'MongoDB connected successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'DB failed', error: err.message });
  }
});

// ---- AUTH ROUTES inline ----
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const { protect } = require('./middleware/auth');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

app.post('/api/auth/register', async (req, res) => {
  try {
    await dbConnect();
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: 'User already exists with this email' });
    const user = await User.create({ name, email, password });
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    await dbConnect();
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    res.json({
      _id: user._id, name: user.name, email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

app.get('/api/auth/me', protect, async (req, res) => {
  await dbConnect();
  res.json({ _id: req.user._id, name: req.user.name, email: req.user.email });
});

// ---- EXPENSE ROUTES inline ----
const Expense = require('./models/Expense');

app.get('/api/expenses', protect, async (req, res) => {
  try {
    await dbConnect();
    const { category, sort } = req.query;
    const filter = { user: req.user._id };
    if (category && category !== 'All') filter.category = category;
    const sortOrder = sort === 'oldest' ? { date: 1 } : { date: -1 };
    const expenses = await Expense.find(filter).sort(sortOrder);
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/expenses/stats', protect, async (req, res) => {
  try {
    await dbConnect();
    const expenses = await Expense.find({ user: req.user._id });
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const byCategory = {};
    expenses.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });
    const now = new Date();
    const thisMonth = expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, e) => s + e.amount, 0);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const last7Days = expenses
      .filter((e) => new Date(e.date) >= sevenDaysAgo)
      .reduce((s, e) => s + e.amount, 0);
    res.json({ total, thisMonth, last7Days, count: expenses.length, byCategory });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/expenses', protect, async (req, res) => {
  try {
    await dbConnect();
    const { title, amount, category, description, date } = req.body;
    if (!title || !amount || !category)
      return res.status(400).json({ message: 'Title, amount, and category are required' });
    const expense = await Expense.create({
      user: req.user._id, title, amount, category,
      description: description || '', date: date || Date.now(),
    });
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/expenses/:id', protect, async (req, res) => {
  try {
    await dbConnect();
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    if (expense.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    const { title, amount, category, description, date } = req.body;
    expense.title = title ?? expense.title;
    expense.amount = amount ?? expense.amount;
    expense.category = category ?? expense.category;
    expense.description = description ?? expense.description;
    expense.date = date ?? expense.date;
    const updated = await expense.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/expenses/:id', protect, async (req, res) => {
  try {
    await dbConnect();
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    if (expense.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await expense.deleteOne();
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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
