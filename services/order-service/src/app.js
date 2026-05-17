const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const { errorHandler } = require("@ecommerce/shared");
const orderRoutes = require("./routes/order.routes");
const { startConsumers } = require("./events/consumers");

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  req.id = req.headers["x-request-id"] || uuidv4();
  res.setHeader("x-request-id", req.id);
  next();
});

app.get("/health", (_req, res) => res.json({ status: "ok", service: "order" }));
app.use("/api/v1/orders", orderRoutes);
app.use(errorHandler);

startConsumers().catch(console.error);
module.exports = app;
