const express = require("express");
const ctrl = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", ctrl.register);
router.post("/login", ctrl.login);
router.post("/refresh", ctrl.refresh);
router.post("/logout", ctrl.logout);
router.get("/verify", ctrl.verify);

module.exports = router;
