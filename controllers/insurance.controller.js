import db from '../config/database.js';

// Create Insurance Information
export const createInsuranceInfo = async (req, res) => {
  const {
    member_id,
    email,
    login_id,
    password,
    insurance_portal_url,
    customer_id_policy_login_id,
    agent_name
  } = req.body;

  try {
    // Validate required fields
    if (!member_id) {
      return res.status(400).json({ error: 'Member ID is required' });
    }

    // Insert or update insurance info (assuming one record per member for simplicity)
    const [existingInfo] = await db.query('SELECT insurance_id FROM insurance_info WHERE member_id = ?', [member_id]);
    let insurance_id;

    if (existingInfo.length > 0) {
      // Update existing record
      insurance_id = existingInfo[0].insurance_id;
      await db.query(
        `UPDATE insurance_info SET 
          email = ?, login_id = ?, password = ?, insurance_portal_url = ?, 
          customer_id_policy_login_id = ?, agent_name = ?
        WHERE insurance_id = ?`,
        [
          email || null,
          login_id || null,
          password || null,
          insurance_portal_url || null,
          customer_id_policy_login_id || null,
          agent_name || null,
          insurance_id
        ]
      );
    } else {
      // Insert new record
      const [result] = await db.query(
        `INSERT INTO insurance_info (
          member_id, email, login_id, password, insurance_portal_url, 
          customer_id_policy_login_id, agent_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          member_id,
          email || null,
          login_id || null,
          password || null,
          insurance_portal_url || null,
          customer_id_policy_login_id || null,
          agent_name || null
        ]
      );
      insurance_id = result.insertId;
    }

    res.status(200).json({ message: 'Insurance information saved successfully', insurance_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save insurance information' });
  }
};

// Get Insurance Information by Member ID
export const getInsuranceInfoByMember = async (req, res) => {
  const { member_id } = req.params;

  try {
    const [insuranceInfo] = await db.query('SELECT * FROM insurance_info WHERE member_id = ?', [member_id]);
    if (insuranceInfo.length === 0) {
      return res.status(200).json(null); // Return null if no insurance info found
    }

    res.status(200).json(insuranceInfo[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve insurance information' });
  }
};