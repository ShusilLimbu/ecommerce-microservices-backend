const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const repo = require("../repositories/auth.repository");
const { publishEvent, EVENTS } = require("@ecommerce/shared");
const { AppError } = require("@ecommerce/shared");

const SALT_ROUNDS = 10;

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, roles: ["customer"] },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
  );
}

function createRefreshToken() {
  return crypto.randomBytes(48).toString("hex");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function register({ email, password, firstName, lastName }) {
  const existing = await repo.findByEmail(email);
  if (existing) throw new AppError("Email already registered", 409, "EMAIL_EXISTS");

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await repo.createUser(email, passwordHash);

  await publishEvent(EVENTS.USER_REGISTERED, {
    userId: user.id,
    email: user.email,
    firstName: firstName || "",
    lastName: lastName || "",
  });

  const accessToken = signAccessToken(user);
  const refreshToken = createRefreshToken();
  const days = parseInt(process.env.REFRESH_EXPIRES_DAYS || "7", 10);
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  await repo.saveRefreshToken(user.id, hashToken(refreshToken), expiresAt);

  return { userId: user.id, accessToken, refreshToken, expiresIn: 900 };
}

async function login({ email, password }) {
  const user = await repo.findByEmail(email);
  if (!user) throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");

  const accessToken = signAccessToken(user);
  const refreshToken = createRefreshToken();
  const days = parseInt(process.env.REFRESH_EXPIRES_DAYS || "7", 10);
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  await repo.saveRefreshToken(user.id, hashToken(refreshToken), expiresAt);

  return { userId: user.id, accessToken, refreshToken, expiresIn: 900 };
}

async function refresh(refreshToken) {
  const row = await repo.findRefreshToken(hashToken(refreshToken));
  if (!row) throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH");

  const user = await repo.findById(row.user_id);
  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");

  const accessToken = signAccessToken(user);
  return { accessToken, expiresIn: 900 };
}

async function logout(refreshToken) {
  if (refreshToken) await repo.revokeRefreshToken(hashToken(refreshToken));
}

function verifyAccessToken(token) {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return { valid: true, sub: payload.sub, email: payload.email, roles: payload.roles };
  } catch {
    return { valid: false };
  }
}

module.exports = { register, login, refresh, logout, verifyAccessToken };
