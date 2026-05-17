const { query } = require("../db/pool");

async function createOrder({ userId, items, shippingAddr, currency }) {
  const totalCents = items.reduce((s, i) => s + i.quantity * i.unitPriceCents, 0);
  const client = await require("../db/pool").pool.connect();
  try {
    await client.query("BEGIN");
    const orderRes = await client.query(
      `INSERT INTO orders (user_id, status, total_cents, currency, shipping_addr)
       VALUES ($1, 'PENDING', $2, $3, $4) RETURNING *`,
      [userId, totalCents, currency || "USD", JSON.stringify(shippingAddr)]
    );
    const order = orderRes.rows[0];
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price_cents)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, item.productId, item.productName, item.quantity, item.unitPriceCents]
      );
    }
    await client.query("COMMIT");
    return order;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

async function getOrderItems(orderId) {
  const r = await query(`SELECT * FROM order_items WHERE order_id = $1`, [orderId]);
  return r.rows;
}

async function findById(orderId, userId) {
  const r = await query(`SELECT * FROM orders WHERE id = $1 AND user_id = $2`, [orderId, userId]);
  return r.rows[0];
}

async function listByUser(userId, limit = 20, offset = 0) {
  const r = await query(
    `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return r.rows;
}

async function updateStatus(orderId, status) {
  const r = await query(
    `UPDATE orders SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [orderId, status]
  );
  return r.rows[0];
}

module.exports = { createOrder, getOrderItems, findById, listByUser, updateStatus };
