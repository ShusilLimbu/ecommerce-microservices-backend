const { serviceGet } = require("@ecommerce/shared");

const baseUrl = () => process.env.USER_SERVICE_URL || "http://localhost:3002";
const apiKey = () => process.env.INTERNAL_API_KEY || "dev-internal-key";

async function getUser(userId) {
  return serviceGet(baseUrl(), `/internal/users/${userId}`, {
    "x-internal-api-key": apiKey(),
  });
}

async function userExists(userId) {
  const r = await serviceGet(baseUrl(), `/internal/users/${userId}/exists`, {
    "x-internal-api-key": apiKey(),
  });
  return r.exists;
}

module.exports = { getUser, userExists };
