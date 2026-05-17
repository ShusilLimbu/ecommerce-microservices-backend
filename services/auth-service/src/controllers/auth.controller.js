const authService = require("../services/auth.service");

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

async function refresh(req, res, next) {
  try {
    const token = req.body.refreshToken;
    const result = await authService.refresh(token);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.body.refreshToken);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

async function verify(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    const result = authService.verifyAccessToken(token);
    if (!result.valid) return res.status(401).json({ valid: false });
    res.json(result);
  } catch (e) {
    next(e);
  }
}

module.exports = { register, login, refresh, logout, verify };
