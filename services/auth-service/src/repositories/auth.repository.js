const { query } = require("../db/pool");

async function findByEmail(email) {
  const r = await query("SELECT * FROM users_auth WHERE email = $1", [email.toLowerCase()]);
  return r.rows[0];
}

async function findById(id) {
  const r = await query("SELECT id, email, email_verified, created_at FROM users_auth WHERE id = $1", [id]);
  return r.rows[0];
}

async function createUser(email, passwordHash) {
  const r = await query(
    `INSERT INTO users_auth (email, password_hash) VALUES ($1, $2)
     RETURNING id, email, created_at`,
    [email.toLowerCase(), passwordHash]
  );
  return r.rows[0];
}

async function saveRefreshToken(userId, tokenHash, expiresAt) {
  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );
}

async function findRefreshToken(tokenHash) {
  const r = await query(
    `SELECT * FROM refresh_tokens WHERE token_hash = $1 AND revoked = FALSE AND expires_at > NOW()`,
    [tokenHash]
  );
  return r.rows[0];
}

async function revokeRefreshToken(tokenHash) {
  await query(`UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = $1`, [tokenHash]);
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  saveRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
};
