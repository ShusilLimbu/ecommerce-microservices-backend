const express = require("express");
const { authGuard } = require("@ecommerce/shared");
const ctrl = require("../controllers/user.controller");
const { internalAuth } = require("../middleware/internalAuth");

const router = express.Router();
router.get("/me", authGuard(), ctrl.getMe);
router.patch("/me", authGuard(), ctrl.updateMe);
router.get("/me/addresses", authGuard(), ctrl.listAddresses);
router.post("/me/addresses", authGuard(), ctrl.createAddress);
router.delete("/me/addresses/:id", authGuard(), ctrl.deleteAddress);
module.exports = router;

const internalRouter = express.Router();
internalRouter.use(internalAuth);
internalRouter.get("/users/:userId", ctrl.internalGetUser);
internalRouter.get("/users/:userId/exists", ctrl.internalExists);
module.exports.internalRouter = internalRouter;
