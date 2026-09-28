"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const demoController_1 = require("../controllers/demoController");
const router = (0, express_1.Router)();
router.post('/advance-queue', demoController_1.advanceQueue);
router.post('/toggle-counters', demoController_1.toggleCounters);
router.post('/reset-ramesh-token', demoController_1.resetRameshToken);
exports.default = router;
