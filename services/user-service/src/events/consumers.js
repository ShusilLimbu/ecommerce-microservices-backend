const repo = require("../repositories/user.repository");
const { subscribeEvent, EVENTS } = require("@ecommerce/shared");

async function startConsumers() {
  await subscribeEvent(EVENTS.USER_REGISTERED, async (data) => {
    console.log("Creating profile for", data.userId);
    await repo.createProfile({
      userId: data.userId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
    });
  });
}

module.exports = { startConsumers };
