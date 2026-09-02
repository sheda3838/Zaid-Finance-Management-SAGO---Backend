import Transaction from '../models/Transaction.js';
import mongoose from 'mongoose';

const isFutureDate = (dateInput) => {
  const inputDate = new Date(dateInput);
  const now = new Date();
  // Set to the end of today to avoid time-of-day differences
  now.setHours(23, 59, 59, 999);
  return inputDate > now;
};

// Create Transaction
export const createTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;
    
    // Validate required fields
    if (!type || !amount || !category || !date) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // Validate type
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Type must be either "income" or "expense".' });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0.' });
    }

    if (isFutureDate(date)) {
      return res.status(400).json({ message: 'Transaction date cannot be in the future.' });
    }

    const userId = req.user.id;

    const newTransaction = await Transaction.create({
      userId,
      type,
      amount,
      category,
      description,
      date
    });

    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Server error creating transaction.' });
  }
};

// Get All Transactions
export const getTransactions = async (req, res) => {
  try {
    const { search, type, category, sort, limit } = req.query;

    const filter = { userId: req.user.id };

    // Type Filter
    if (type) {
      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ message: 'Invalid type. Allowed values are "income" or "expense".' });
      }
      filter.type = type;
    }

    // Category Filter
    if (category) {
      filter.category = category;
    }

    // Keyword Search (Description)
    if (search) {
      // Safely escape special regex characters
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.description = { $regex: new RegExp(escapedSearch, 'i') };
    }

    // Sorting
    let sortOption = { date: -1 }; // newest by default
    if (sort) {
      if (!['newest', 'oldest'].includes(sort)) {
        return res.status(400).json({ message: 'Invalid sort. Allowed values are "newest" or "oldest".' });
      }
      sortOption = { date: sort === 'oldest' ? 1 : -1 };
    }

    // Build Query
    let query = Transaction.find(filter).sort(sortOption);

    // Limit
    if (limit) {
      const limitNumber = parseInt(limit, 10);
      if (isNaN(limitNumber) || limitNumber <= 0) {
        return res.status(400).json({ message: 'Invalid limit. Must be a positive integer.' });
      }
      query = query.limit(limitNumber);
    }

    const transactions = await query;
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error fetching transactions.' });
  }
};

// Get Transaction By ID
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid transaction ID format.' });
    }

    const transaction = await Transaction.findOne({ _id: id, userId: req.user.id });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    res.status(200).json(transaction);
  } catch (error) {
    console.error('Error fetching transaction by ID:', error);
    res.status(500).json({ message: 'Server error fetching transaction.' });
  }
};

// Update Transaction
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, category, description, date } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid transaction ID format.' });
    }

    // Validation
    if (type && !['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Type must be either "income" or "expense".' });
    }
    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0.' });
    }

    if (date && isFutureDate(date)) {
      return res.status(400).json({ message: 'Transaction date cannot be in the future.' });
    }

    // Only allow specific fields to be updated
    const updates = {};
    if (type) updates.type = type;
    if (amount) updates.amount = amount;
    if (category) updates.category = category;
    if (description !== undefined) updates.description = description;
    if (date) updates.date = date;

    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { $set: updates },
      { new: true, runValidators: true } // Return updated doc, run schema validators
    );

    if (!updatedTransaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    res.status(200).json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ message: 'Server error updating transaction.' });
  }
};

// Delete Transaction
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid transaction ID format.' });
    }

    const deletedTransaction = await Transaction.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!deletedTransaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    res.status(200).json({ message: 'Transaction deleted successfully.' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: 'Server error deleting transaction.' });
  }
};
