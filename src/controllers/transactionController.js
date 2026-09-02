import Transaction from '../models/Transaction.js';
import mongoose from 'mongoose';

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

    // To be replaced with req.user.id once JWT middleware is implemented.
    const userId = req.body.userId || new mongoose.Types.ObjectId().toString();

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
    // TEMPORARY: Optional filter by userId from query params for testing.
    // To be replaced with { userId: req.user.id } once JWT middleware is implemented.
    const filter = req.query.userId ? { userId: req.query.userId } : {};
    
    const transactions = await Transaction.find(filter).sort({ date: -1 });
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

    const transaction = await Transaction.findById(id);
    
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

    // Only allow specific fields to be updated
    const updates = {};
    if (type) updates.type = type;
    if (amount) updates.amount = amount;
    if (category) updates.category = category;
    if (description !== undefined) updates.description = description;
    if (date) updates.date = date;

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
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

    const deletedTransaction = await Transaction.findByIdAndDelete(id);

    if (!deletedTransaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    res.status(200).json({ message: 'Transaction deleted successfully.' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: 'Server error deleting transaction.' });
  }
};
