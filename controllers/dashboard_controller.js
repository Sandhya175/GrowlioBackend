import db from '../config/database.js';

export const getDashboardData = async (req, res) => {
  const userId = req.user.id; // Changed from user_id to id to match JWT payload

  try {
    const [overviewRows] = await db.query(
      'SELECT title, value, icon, icon_color, extra FROM portfolio_overviews WHERE user_id = ?',
      [userId]
    );

    const [transactionRows] = await db.query(
      'SELECT asset, type, amount, date, status FROM transactions WHERE user_id = ?',
      [userId]
    );

    res.json({
      overview: overviewRows,
      transactions: transactionRows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};