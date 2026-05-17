const repo = require("../repositories/order.repository");
const userClient = require("../clients/user.client");
const { publishEvent, EVENTS } = require("@ecommerce/shared");
const { AppError } = require("@ecommerce/shared");

function mapOrder(order, items) {
  return {
    id: order.id,
    userId: order.user_id,
    status: order.status,
    totalCents: order.total_cents,
    currency: order.currency,
    shippingAddress: order.shipping_addr,
    items: items.map((i) => ({
      id: i.id,
      productId: i.product_id,
      productName: i.product_name,
      quantity: i.quantity,
      unitPriceCents: i.unit_price_cents,
    })),
    createdAt: order.created_at,
    updatedAt: order.updated_at,
  };
}

async function createOrder(userId, body) {
  const exists = await userClient.userExists(userId);
  if (!exists) throw new AppError("User profile not ready", 400, "USER_NOT_READY");

  const user = await userClient.getUser(userId);
  let shippingAddr = body.shippingAddress;
  if (body.shippingAddressId && user.addresses) {
    const found = user.addresses.find((a) => a.id === body.shippingAddressId);
    if (!found) throw new AppError("Address not found", 400, "INVALID_ADDRESS");
    shippingAddr = found;
  }
  if (!shippingAddr) {
    shippingAddr = user.defaultAddress;
  }
  if (!shippingAddr) throw new AppError("Shipping address required", 400, "ADDRESS_REQUIRED");

  if (!body.items?.length) throw new AppError("Items required", 400, "VALIDATION_ERROR");

  const order = await repo.createOrder({
    userId,
    items: body.items,
    shippingAddr,
    currency: body.currency,
  });
  const items = await repo.getOrderItems(order.id);

  await publishEvent(EVENTS.ORDER_CREATED, {
    orderId: order.id,
    userId,
    totalCents: order.total_cents,
  });

  return mapOrder(order, items);
}

async function getOrder(userId, orderId) {
  const order = await repo.findById(orderId, userId);
  if (!order) throw new AppError("Order not found", 404, "NOT_FOUND");
  const items = await repo.getOrderItems(orderId);
  return mapOrder(order, items);
}

async function listOrders(userId, query) {
  const limit = Math.min(parseInt(query.limit || "20", 10), 100);
  const offset = parseInt(query.offset || "0", 10);
  const orders = await repo.listByUser(userId, limit, offset);
  const result = [];
  for (const o of orders) {
    const items = await repo.getOrderItems(o.id);
    result.push(mapOrder(o, items));
  }
  return result;
}

async function cancelOrder(userId, orderId) {
  const order = await repo.findById(orderId, userId);
  if (!order) throw new AppError("Order not found", 404, "NOT_FOUND");
  if (!["PENDING", "PAID"].includes(order.status)) {
    throw new AppError("Cannot cancel order in current status", 400, "INVALID_STATUS");
  }
  const updated = await repo.updateStatus(orderId, "CANCELLED");
  await publishEvent(EVENTS.ORDER_CANCELLED, { orderId, userId });
  const items = await repo.getOrderItems(orderId);
  return mapOrder(updated, items);
}

module.exports = { createOrder, getOrder, listOrders, cancelOrder };
