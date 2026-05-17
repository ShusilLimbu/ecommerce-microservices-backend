require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { createProxyMiddleware } = require("http-proxy-middleware");

const PORT = process.env.PORT || 8080;
const AUTH_URL = process.env.AUTH_SERVICE_URL || "http://localhost:3001";
const USER_URL = process.env.USER_SERVICE_URL || "http://localhost:3002";
const ORDER_URL = process.env.ORDER_SERVICE_URL || "http://localhost:3003";
const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret-change-in-production";

const PUBLIC_AUTH = ["/register", "/login", "/refresh", "/health"];

function requiresAuth(path) {
  if (path.includes("/health")) return false;
  if (path.startsWith("/api/v1/auth")) {
    return !PUBLIC_AUTH.some((p) => path.endsWith(p) || path.includes(p));
  }
  return path.startsWith("/api/v1/users") || path.startsWith("/api/v1/orders");
}

function authMiddleware(req, res, next) {
  if (!requiresAuth(req.path)) return next();
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ code: "UNAUTHORIZED", message: "Missing token" });
  }
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET);
    req.headers["x-user-id"] = payload.sub;
    next();
  } catch {
    res.status(401).json({ code: "UNAUTHORIZED", message: "Invalid token" });
  }
}

const proxyOpts = (target) => ({
  target,
  changeOrigin: true,
  on: {
    proxyReq(proxyReq, req) {
      if (req.headers["x-user-id"]) {
        proxyReq.setHeader("x-user-id", req.headers["x-user-id"]);
      }
      if (req.headers["x-request-id"]) {
        proxyReq.setHeader("x-request-id", req.headers["x-request-id"]);
      }
    },
  },
});

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  if (!req.headers["x-request-id"]) {
    req.headers["x-request-id"] = require("crypto").randomUUID();
  }
  next();
});

app.get("/health", (_req, res) => res.json({ status: "ok", service: "gateway" }));

app.use(authMiddleware);

app.use("/api/v1/auth", createProxyMiddleware(proxyOpts(AUTH_URL)));
app.use("/api/v1/users", createProxyMiddleware(proxyOpts(USER_URL)));
app.use("/api/v1/orders", createProxyMiddleware(proxyOpts(ORDER_URL)));

app.listen(PORT, () => console.log(`API Gateway on ${PORT}`));
