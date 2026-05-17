const { query } = require("../db/pool");

async function createProfile({ userId, email, firstName, lastName }) {
  const r = await query(
    `INSERT INTO user_profiles (id, email, first_name, last_name)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (id) DO NOTHING
     RETURNING *`,
    [userId, email, firstName, lastName]
  );
  return r.rows[0];
}

async function getProfile(userId) {
  const r = await query(`SELECT * FROM user_profiles WHERE id = $1`, [userId]);
  return r.rows[0];
}

async function updateProfile(userId, fields) {
  const r = await query(
    `UPDATE user_profiles SET
      first_name = COALESCE($2, first_name),
      last_name = COALESCE($3, last_name),
      phone = COALESCE($4, phone),
      updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [userId, fields.firstName, fields.lastName, fields.phone]
  );
  return r.rows[0];
}

async function listAddresses(userId) {
  const r = await query(`SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC`, [userId]);
  return r.rows;
}

async function getAddress(userId, addressId) {
  const r = await query(`SELECT * FROM addresses WHERE id = $1 AND user_id = $2`, [addressId, userId]);
  return r.rows[0];
}

async function createAddress(userId, addr) {
  if (addr.isDefault) {
    await query(`UPDATE addresses SET is_default = FALSE WHERE user_id = $1`, [userId]);
  }
  const r = await query(
    `INSERT INTO addresses (user_id, line1, line2, city, state, postal_code, country, is_default)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [userId, addr.line1, addr.line2, addr.city, addr.state, addr.postalCode, addr.country, !!addr.isDefault]
  );
  return r.rows[0];
}

async function deleteAddress(userId, addressId) {
  await query(`DELETE FROM addresses WHERE id = $1 AND user_id = $2`, [addressId, userId]);
}

async function exists(userId) {
  const r = await query(`SELECT 1 FROM user_profiles WHERE id = $1`, [userId]);
  return r.rowCount > 0;
}

module.exports = {
  createProfile, getProfile, updateProfile,
  listAddresses, getAddress, createAddress, deleteAddress, exists,
};
