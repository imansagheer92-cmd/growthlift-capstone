const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// ── DB connection cache ──────────────────────────────────────────
let cached = global._mongoConn || null;
async function connectDB() {
  if (cached && mongoose.connection.readyState === 1) return;
  cached = await mongoose.connect(process.env.MONGO_URI);
  global._mongoConn = cached;
}

// ── Mongoose Models ──────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function(entered) {
  return bcrypt.compare(entered, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

const expenseSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true, trim: true },
  amount:      { type: Number, required: true, min: 0.01 },
  category:    { type: String, required: true, enum: ['Food & Dining','Transport','Shopping','Entertainment','Health','Education','Utilities','Other'], default: 'Other' },
  description: { type: String, default: '' },
  date:        { type: Date, default: Date.now },
}, { timestamps: true });

const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);

// ── Helpers ──────────────────────────────────────────────────────
const genToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer '))
    return res.status(401).json({ message: 'Not authorized, no token' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// ── Routes ───────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: 'SpendWise API is running.' }));

// Auth
app.post('/api/auth/register', async (req, res) => {
  try {
    await connectDB();
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'User already exists with this email' });
    const user = await User.create({ name, email, password });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, token: genToken(user._id) });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: err.message, stack: err.stack });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ _id: user._id, name: user.name, email: user.email, token: genToken(user._id) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/auth/me', protect, async (req, res) => {
  res.json({ _id: req.user._id, name: req.user.name, email: req.user.email });
});

// Expenses
app.get('/api/expenses/stats', protect, async (req, res) => {
  try {
    await connectDB();
    const expenses = await Expense.find({ user: req.user._id });
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const byCategory = {};
    expenses.forEach((e) => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });
    const now = new Date();
    const thisMonth = expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((s, e) => s + e.amount, 0);
    const ago7 = new Date(); ago7.setDate(ago7.getDate() - 7);
    const last7Days = expenses.filter((e) => new Date(e.date) >= ago7).reduce((s, e) => s + e.amount, 0);
    res.json({ total, thisMonth, last7Days, count: expenses.length, byCategory });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/expenses', protect, async (req, res) => {
  try {
    await connectDB();
    const { category, sort } = req.query;
    const filter = { user: req.user._id };
    if (category && category !== 'All') filter.category = category;
    const expenses = await Expense.find(filter).sort(sort === 'oldest' ? { date: 1 } : { date: -1 });
    res.json(expenses);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/expenses', protect, async (req, res) => {
  try {
    await connectDB();
    const { title, amount, category, description, date } = req.body;
    if (!title || !amount || !category)
      return res.status(400).json({ message: 'Title, amount, and category are required' });
    const expense = await Expense.create({ user: req.user._id, title, amount, category, description: description || '', date: date || Date.now() });
    res.status(201).json(expense);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

app.put('/api/expenses/:id', protect, async (req, res) => {
  try {
    await connectDB();
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    if (expense.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    const { title, amount, category, description, date } = req.body;
    if (title !== undefined) expense.title = title;
    if (amount !== undefined) expense.amount = amount;
    if (category !== undefined) expense.category = category;
    if (description !== undefined) expense.description = description;
    if (date !== undefined) expense.date = date;
    res.json(await expense.save());
  } catch (err) { res.status(400).json({ message: err.message }); }
});

app.delete('/api/expenses/:id', protect, async (req, res) => {
  try {
    await connectDB();
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    if (expense.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await expense.deleteOne();
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => app.listen(PORT, () => console.log(`Running on ${PORT}`))).catch(console.error);
}

module.exports = app;
