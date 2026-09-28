"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const queueController_1 = require("../controllers/queueController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public: a farmer scans a printed token at the gate, so lookup stays open.
router.get('/:token', queueController_1.getQueueByToken);
// All state-changing queue operations require an authenticated official/admin.
router.post('/:token/arrive', auth_1.authenticateJwt, queueController_1.markArrival);
router.post('/:token/call', auth_1.authenticateJwt, queueController_1.callFarmer);
router.post('/:token/start', auth_1.authenticateJwt, queueController_1.startProcessing);
router.post('/:token/complete', auth_1.authenticateJwt, queueController_1.completeQueue);
router.post('/:token/no-show', auth_1.authenticateJwt, queueController_1.markNoShow);
exports.default = router;
