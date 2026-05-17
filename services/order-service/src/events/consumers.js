const repo = require("../repositories/order.repository");
const { subscribeEvent, EVENTS, publishEvent } = require("@ecommerce/shared");

async function simulatePayment(orderId) {
  setTimeout(async () => {
    const updated = await repo.updateStatus(orderId, "PAID");
    if (updated) {
      await publishEvent(EVENTS.ORDER_PAID, { orderId, userId: updated.user_id });
      console.log("Order paid (simulated):", orderId);
    }
  }, 3000);
}

async function startConsumers() {
  await subscribeEvent(EVENTS.ORDER_CREATED, async (data) => {
    console.log("Processing payment for order", data.orderId);
    await simulatePayment(data.orderId);
  });
}

module.exports = { startConsumers };
