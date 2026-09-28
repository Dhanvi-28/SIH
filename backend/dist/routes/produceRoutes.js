"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const produceController_1 = require("../controllers/produceController");
const router = (0, express_1.Router)();
router.get('/', produceController_1.getProduces);
exports.default = router;
