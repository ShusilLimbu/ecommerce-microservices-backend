const jwt = require("jsonwebtoken");
const { AppError } = require("../errors/AppError");

function authGuard(options = {}) {
  const { roles = [] } = options;
  const secret = process.env.JWT_SECRET;

  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return next(new AppError("Missing or invalid authorization", 401, "UNAUTHORIZED"));
    }
    const token = header.slice(7);
    try {
      const payload = jwt.verify(token, secret);
      req.user = { id: payload.sub, email: payload.email, roles: payload.roles || [] };
      if (roles.length && !roles.some((r) => req.user.roles.includes(r))) {
        return next(new AppError("Forbidden", 403, "FORBIDDEN"));
      }
      next();
    } catch {
      next(new AppError("Invalid or expired token", 401, "UNAUTHORIZED"));
    }
  };
}

module.exports = { authGuard };
