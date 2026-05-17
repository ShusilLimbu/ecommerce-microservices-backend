const amqp = require("amqplib");
const { EVENTS } = require("./types");

const EXCHANGE = "ecommerce.events";

let channelPromise = null;

async function getChannel() {
  if (!channelPromise) {
    channelPromise = (async () => {
      const url = process.env.RABBITMQ_URL || "amqp://localhost:5672";
      const conn = await amqp.connect(url);
      const ch = await conn.createChannel();
      await ch.assertExchange(EXCHANGE, "topic", { durable: true });
      console.log("RabbitMQ connected");
      return ch;
    })().catch((err) => {
      channelPromise = null;
      throw err;
    });
  }
  return channelPromise;
}

async function publishEvent(routingKey, payload) {
  try {
    const ch = await getChannel();
    ch.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
      contentType: "application/json",
    });
  } catch (err) {
    console.warn("Event publish skipped:", routingKey, err.message);
  }
}

async function subscribeEvent(routingKey, handler) {
  const connect = async (attempt = 1) => {
    try {
      const ch = await getChannel();
      const queue = await ch.assertQueue("", { exclusive: true });
      await ch.bindQueue(queue.queue, EXCHANGE, routingKey);
      ch.consume(queue.queue, async (msg) => {
        if (!msg) return;
        try {
          const data = JSON.parse(msg.content.toString());
          await handler(data);
          ch.ack(msg);
        } catch (err) {
          console.error("Event handler error", routingKey, err);
          ch.nack(msg, false, false);
        }
      });
      console.log("Subscribed to", routingKey);
    } catch (err) {
      console.warn(`RabbitMQ subscribe retry ${attempt} for ${routingKey}:`, err.message);
      setTimeout(() => connect(attempt + 1), Math.min(5000 * attempt, 30000));
    }
  };
  connect();
}

module.exports = { publishEvent, subscribeEvent, EXCHANGE, EVENTS };
