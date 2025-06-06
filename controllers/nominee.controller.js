import db from '../config/database.js';

// Create a Nominee
export const createNominee = async (req, res) => {
  const {
    member_id,
    category,
    demat_account_no,
    trading_account_no,
    broker_name,
    broker_code,
    nominee_name,
    relationship_with_account_holder,
    date_of_birth,
    percentage_share,
    address
  } = req.body;

  try {
    // Validate required fields
    if (!member_id || !category || !nominee_name) {
      return res.status(400).json({ error: 'Member ID, category, and nominee name are required' });
    }

    // Insert nominee into the database
    const [result] = await db.query(
      `INSERT INTO nominees (
        member_id, category, demat_account_no, trading_account_no, broker_name, broker_code,
        nominee_name, relationship_with_account_holder, date_of_birth, percentage_share, address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        member_id,
        category,
        demat_account_no || null,
        trading_account_no || null,
        broker_name || null,
        broker_code || null,
        nominee_name,
        relationship_with_account_holder || null,
        date_of_birth || null,
        percentage_share || null,
        address || null
      ]
    );

    const nominee_id = result.insertId;
    res.status(201).json({ message: 'Nominee created successfully', nominee_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create nominee' });
  }
};

// Create a Guardian for a Nominee
export const createGuardian = async (req, res) => {
  const {
    nominee_id,
    guardian_name,
    relationship_with_nominee,
    contact_number,
    address
  } = req.body;

  try {
    // Validate required fields
    if (!nominee_id || !guardian_name) {
      return res.status(400).json({ error: 'Nominee ID and guardian name are required' });
    }

    // Check if the nominee exists
    const [nominee] = await db.query('SELECT * FROM nominees WHERE nominee_id = ?', [nominee_id]);
    if (nominee.length === 0) {
      return res.status(404).json({ error: 'Nominee not found' });
    }

    // Insert guardian into the database
    const [result] = await db.query(
      `INSERT INTO guardians (
        nominee_id, guardian_name, relationship_with_nominee, contact_number, address
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        nominee_id,
        guardian_name,
        relationship_with_nominee || null,
        contact_number || null,
        address || null
      ]
    );

    const guardian_id = result.insertId;
    res.status(201).json({ message: 'Guardian created successfully', guardian_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create guardian' });
  }
};

// Get Nominees by Member ID
export const getNomineesByMember = async (req, res) => {
  const { member_id } = req.params;

  try {
    // Fetch nominees for the member
    const [nominees] = await db.query('SELECT * FROM nominees WHERE member_id = ?', [member_id]);
    if (nominees.length === 0) {
      return res.status(200).json([]); // Return empty array if no nominees found
    }

    // Fetch guardians for each nominee
    const nomineeIds = nominees.map(n => n.nominee_id);
    const [guardians] = await db.query('SELECT * FROM guardians WHERE nominee_id IN (?)', [nomineeIds]);

    // Map guardians to their respective nominees
    const nomineesWithGuardians = nominees.map(nominee => {
      const guardian = guardians.find(g => g.nominee_id === nominee.nominee_id) || null;
      return { ...nominee, guardian };
    });

    res.status(200).json(nomineesWithGuardians);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve nominees' });
  }
};