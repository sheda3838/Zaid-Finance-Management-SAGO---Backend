import Transaction from '../models/Transaction.js';
import mongoose from 'mongoose';

// Helper to get the start date in UTC
const getStartDate = (period) => {
  if (period === 'all') return null;
  const date = new Date();
  const daysToSubtract = period === '7d' ? 6 : 29;
  date.setUTCDate(date.getUTCDate() - daysToSubtract);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

// Get Dashboard Summary
export const getSummary = async (req, res) => {
  try {
    const period = req.query.period || 'all';
    
    if (!['all', '7d', '30d'].includes(period)) {
      return res.status(400).json({ message: 'Invalid period. Allowed values are all, 7d, 30d.' });
    }

    const matchStage = { userId: new mongoose.Types.ObjectId(req.user.id) };
    const startDate = getStartDate(period);
    if (startDate) {
      matchStage.date = { $gte: startDate };
    }

    const summary = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
            }
          },
          totalExpenses: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
            }
          }
        }
      }
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;

    if (summary.length > 0) {
      totalIncome = summary[0].totalIncome;
      totalExpenses = summary[0].totalExpenses;
    }

    const balance = totalIncome - totalExpenses;

    res.status(200).json({
      period,
      totalIncome,
      totalExpenses,
      balance
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ message: 'Server error fetching dashboard summary.' });
  }
};

// Get Dashboard Trends
export const getTrends = async (req, res) => {
  try {
    const period = req.query.period || 'all';
    
    if (!['all', '7d', '30d'].includes(period)) {
      return res.status(400).json({ message: 'Invalid period. Allowed values are all, 7d, 30d.' });
    }

    const matchStage = { userId: new mongoose.Types.ObjectId(req.user.id) };
    const startDate = getStartDate(period);
    if (startDate) {
      matchStage.date = { $gte: startDate };
    }

    const trends = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          // Format date as YYYY-MM-DD
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          income: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
            }
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Create a map of the aggregated results
    const dataMap = {};
    trends.forEach(item => {
      dataMap[item._id] = {
        date: item._id,
        income: item.income,
        expense: item.expense
      };
    });

    if (trends.length === 0) {
      return res.status(200).json({ period, data: [] });
    }

    let filledData = [];
    
    if (period === 'all') {
      filledData = trends.map(item => ({
        date: item._id,
        income: item.income,
        expense: item.expense
      }));
    } else {
      // Pad with zero-value days for a continuous chart
      const days = period === '7d' ? 7 : 30;
      
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setUTCDate(d.getUTCDate() - i);
        const dateString = d.toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (dataMap[dateString]) {
          filledData.push(dataMap[dateString]);
        } else {
          filledData.push({ date: dateString, income: 0, expense: 0 });
        }
      }
    }

    res.status(200).json({
      period,
      data: filledData
    });
  } catch (error) {
    console.error('Error fetching dashboard trends:', error);
    res.status(500).json({ message: 'Server error fetching dashboard trends.' });
  }
};
