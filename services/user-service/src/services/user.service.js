const repo = require("../repositories/user.repository");
const { AppError } = require("@ecommerce/shared");

function mapProfile(row, addresses = []) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    addresses: addresses.map(mapAddress),
  };
}

function mapAddress(a) {
  return {
    id: a.id,
    line1: a.line1,
    line2: a.line2,
    city: a.city,
    state: a.state,
    postalCode: a.postal_code,
    country: a.country,
    isDefault: a.is_default,
  };
}

async function getMe(userId) {
  const profile = await repo.getProfile(userId);
  if (!profile) throw new AppError("Profile not found", 404, "NOT_FOUND");
  const addresses = await repo.listAddresses(userId);
  return mapProfile(profile, addresses);
}

async function updateMe(userId, body) {
  const updated = await repo.updateProfile(userId, body);
  if (!updated) throw new AppError("Profile not found", 404, "NOT_FOUND");
  return getMe(userId);
}

async function addAddress(userId, body) {
  const profile = await repo.getProfile(userId);
  if (!profile) throw new AppError("Profile not found", 404, "NOT_FOUND");
  const addr = await repo.createAddress(userId, body);
  return mapAddress(addr);
}

async function getInternalUser(userId) {
  const profile = await repo.getProfile(userId);
  if (!profile) return null;
  const addresses = await repo.listAddresses(userId);
  const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];
  return { ...mapProfile(profile, addresses), defaultAddress: defaultAddr ? mapAddress(defaultAddr) : null };
}

module.exports = { getMe, updateMe, addAddress, getInternalUser, mapProfile, mapAddress };
