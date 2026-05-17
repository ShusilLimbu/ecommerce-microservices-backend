const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const { errorHandler } = require("@ecommerce/shared");
const authRoutes = require("./routes/auth.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.id = req.headers["x-request-id"] || uuidv4();
  res.setHeader("x-request-id", req.id);
  next();
});

app.get("/health", (_req, res) => res.json({ status: "ok", service: "auth" }));
app.use("/api/v1/auth", authRoutes);
app.use(errorHandler);

module.exports = app;
