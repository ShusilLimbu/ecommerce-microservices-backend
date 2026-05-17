const express = require("express");
const { authGuard } = require("@ecommerce/shared");
const ctrl = require("../controllers/order.controller");

const router = express.Router();
router.post("/", authGuard(), ctrl.create);
router.get("/", authGuard(), ctrl.list);
router.get("/:orderId", authGuard(), ctrl.getOne);
router.patch("/:orderId/cancel", authGuard(), ctrl.cancel);
module.exports = router;
