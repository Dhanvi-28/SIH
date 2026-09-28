"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentController_1 = require("../controllers/paymentController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticateJwt, paymentController_1.getPayments);
router.post('/:id/process', auth_1.authenticateJwt, paymentController_1.processPayment);
exports.default = router;
