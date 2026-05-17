function internalAuth(req, res, next) {
  const key = req.headers["x-internal-api-key"];
  if (key !== process.env.INTERNAL_API_KEY) {
    return res.status(401).json({ code: "UNAUTHORIZED", message: "Invalid internal API key" });
  }
  next();
}

module.exports = { internalAuth };
