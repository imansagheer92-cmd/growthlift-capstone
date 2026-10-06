const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

// All expense routes are protected
router.use(protect);

// @route   GET /api/expenses
// @desc    Get all expenses for the logged-in user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { category, startDate, endDate, sort } = req.query;

    const filter = { user: req.user._id };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const sortOrder = sort === 'oldest' ? { date: 1 } : { date: -1 };

    const expenses = await Expense.find(filter).sort(sortOrder);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @route   GET /api/expenses/stats
// @desc    Get spending statistics for the logged-in user
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Total by category
    const byCategory = {};
    expenses.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });

    // This month's spending
    const now = new Date();
    const thisMonthExpenses = expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const thisMonth = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const last7Days = expenses
      .filter((e) => new Date(e.date) >= sevenDaysAgo)
      .reduce((sum, e) => sum + e.amount, 0);

    res.json({
      total,
      thisMonth,
      last7Days,
      count: expenses.length,
      byCategory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @route   POST /api/expenses
// @desc    Create a new expense
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { title, amount, category, description, date } = req.body;

    if (!title || !amount || !category) {
      return res.status(400).json({ message: 'Title, amount, and category are required' });
    }

    const expense = await Expense.create({
      user: req.user._id,
      title,
      amount,
      category,
      description: description || '',
      date: date || Date.now(),
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Invalid data' });
  }
});

// @route   PUT /api/expenses/:id
// @desc    Update an expense
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Make sure the expense belongs to the logged-in user
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this expense' });
    }

    const { title, amount, category, description, date } = req.body;

    expense.title = title ?? expense.title;
    expense.amount = amount ?? expense.amount;
    expense.category = category ?? expense.category;
    expense.description = description ?? expense.description;
    expense.date = date ?? expense.date;

    const updated = await expense.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Invalid data' });
  }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete an expense
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this expense' });
    }

    await expense.deleteOne();
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

module.exports = router;
