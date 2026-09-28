"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const slotController_1 = require("../controllers/slotController");
const router = (0, express_1.Router)();
router.get('/recommendations', slotController_1.getSlotRecommendations);
exports.default = router;
