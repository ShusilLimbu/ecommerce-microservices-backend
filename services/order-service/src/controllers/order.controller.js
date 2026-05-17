const orderService = require("../services/order.service");

async function create(req, res, next) {
  try {
    const order = await orderService.createOrder(req.user.id, req.body);
    res.status(201).json(order);
  } catch (e) { next(e); }
}

async function list(req, res, next) {
  try {
    res.json(await orderService.listOrders(req.user.id, req.query));
  } catch (e) { next(e); }
}

async function getOne(req, res, next) {
  try {
    res.json(await orderService.getOrder(req.user.id, req.params.orderId));
  } catch (e) { next(e); }
}

async function cancel(req, res, next) {
  try {
    res.json(await orderService.cancelOrder(req.user.id, req.params.orderId));
  } catch (e) { next(e); }
}

module.exports = { create, list, getOne, cancel };
