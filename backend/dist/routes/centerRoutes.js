"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const centerController_1 = require("../controllers/centerController");
const router = (0, express_1.Router)();
router.get('/', centerController_1.getCenters);
router.get('/:id', centerController_1.getCenterById);
exports.default = router;
