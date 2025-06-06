import db from '../config/database.js';

// Create a Business Entity
export const createBusinessEntity = async (req, res) => {
  const {
    user_id,
    entity_name,
    entity_type,
    registration_number,
    date_of_incorporation,
    contact_number,
    email,
    registered_address,
    pan_number,
    license_number,
    software_license_number,
    partnership_deed_details
  } = req.body;

  // Handle file uploads
  const company_document = req.files?.company_document ? req.files.company_document[0].filename : null;
  const license_document = req.files?.license_document ? req.files.license_document[0].filename : null;
  const software_license_document = req.files?.software_license_document ? req.files.software_license_document[0].filename : null;
  const pan_document = req.files?.pan_document ? req.files.pan_document[0].filename : null;
  const partnership_deed_document = req.files?.partnership_deed_document ? req.files.partnership_deed_document[0].filename : null;
  const profile_image = req.files?.profile_image ? req.files.profile_image[0].filename : null;

  try {
    // Check if a business entity already exists for this user
    const [existingEntity] = await db.query('SELECT id FROM business_entities WHERE user_id = ?', [user_id]);
    let entity_id;

    if (existingEntity.length > 0) {
      // Update existing business entity
      entity_id = existingEntity[0].id;
      await db.query(
        `UPDATE business_entities SET 
          entity_name = ?, entity_type = ?, registration_number = ?, date_of_incorporation = ?, 
          contact_number = ?, email = ?, registered_address = ?, pan_number = ?, 
          license_number = ?, software_license_number = ?, partnership_deed_details = ?,
          company_document = ?, license_document = ?, software_license_document = ?, 
          pan_document = ?, partnership_deed_document = ?, profile_image = ?
        WHERE id = ?`,
        [
          entity_name, entity_type, registration_number, date_of_incorporation,
          contact_number, email, registered_address, pan_number,
          license_number, software_license_number, partnership_deed_details,
          company_document, license_document, software_license_document,
          pan_document, partnership_deed_document, profile_image,
          entity_id
        ]
      );
    } else {
      // Create new business entity
      const [result] = await db.query(
        `INSERT INTO business_entities (
          user_id, entity_name, entity_type, registration_number, date_of_incorporation, 
          contact_number, email, registered_address, pan_number, 
          license_number, software_license_number, partnership_deed_details,
          company_document, license_document, software_license_document, 
          pan_document, partnership_deed_document, profile_image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user_id, entity_name, entity_type, registration_number, date_of_incorporation,
          contact_number, email, registered_address, pan_number,
          license_number, software_license_number, partnership_deed_details,
          company_document, license_document, software_license_document,
          pan_document, partnership_deed_document, profile_image
        ]
      );
      entity_id = result.insertId;
    }

    res.status(200).json({ message: 'Business entity saved successfully', entity_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save business entity' });
  }
};

// Create a Stakeholder for a Business Entity
export const createStakeholder = async (req, res) => {
  const { entity_id, stakeholder_name, stakeholder_type, contact_number, email, share_percentage, id_proof_number } = req.body;
  const id_proof_document = req.file ? req.file.filename : null;

  try {
    const [result] = await db.query(
      `INSERT INTO stakeholders (
        entity_id, stakeholder_name, stakeholder_type, contact_number, email, 
        share_percentage, id_proof_number, id_proof_document
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entity_id, stakeholder_name, stakeholder_type, contact_number, email,
        share_percentage, id_proof_number, id_proof_document
      ]
    );

    const stakeholder_id = result.insertId;
    res.status(201).json({ message: 'Stakeholder created successfully', stakeholder_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create stakeholder' });
  }
};

// Get Business Entity by User ID
export const getBusinessEntityByUser = async (req, res) => {
  const { user_id } = req.params;

  try {
    const [entities] = await db.query('SELECT * FROM business_entities WHERE user_id = ?', [user_id]);
    if (entities.length === 0) {
      return res.status(404).json({ error: 'No business entity found for this user' });
    }

    // Optionally fetch stakeholders for each entity
    const [stakeholders] = await db.query('SELECT * FROM stakeholders WHERE entity_id = ?', [entities[0].id]);
    res.status(200).json({ entity: entities[0], stakeholders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve business entity' });
  }
};