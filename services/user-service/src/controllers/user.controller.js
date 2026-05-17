const userService = require("../services/user.service");
const repo = require("../repositories/user.repository");

async function getMe(req, res, next) {
  try {
    res.json(await userService.getMe(req.user.id));
  } catch (e) { next(e); }
}

async function updateMe(req, res, next) {
  try {
    res.json(await userService.updateMe(req.user.id, req.body));
  } catch (e) { next(e); }
}

async function listAddresses(req, res, next) {
  try {
    const rows = await repo.listAddresses(req.user.id);
    res.json(rows.map(userService.mapAddress));
  } catch (e) { next(e); }
}

async function createAddress(req, res, next) {
  try {
    const addr = await userService.addAddress(req.user.id, req.body);
    res.status(201).json(addr);
  } catch (e) { next(e); }
}

async function deleteAddress(req, res, next) {
  try {
    await repo.deleteAddress(req.user.id, req.params.id);
    res.status(204).send();
  } catch (e) { next(e); }
}

async function internalGetUser(req, res, next) {
  try {
    const user = await userService.getInternalUser(req.params.userId);
    if (!user) return res.status(404).json({ code: "NOT_FOUND", message: "User not found" });
    res.json(user);
  } catch (e) { next(e); }
}

async function internalExists(req, res, next) {
  try {
    const ok = await repo.exists(req.params.userId);
    res.json({ exists: ok });
  } catch (e) { next(e); }
}

module.exports = { getMe, updateMe, listAddresses, createAddress, deleteAddress, internalGetUser, internalExists };
