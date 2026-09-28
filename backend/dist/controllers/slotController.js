"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSlotRecommendations = getSlotRecommendations;
const slotAllocator_1 = require("../services/slotAllocator");
async function getSlotRecommendations(req, res) {
    try {
        const { centerId, produceId, date, quantity } = req.query;
        if (!centerId || !produceId || !date || !quantity) {
            return res.status(400).json({
                success: false,
                error: { code: 'MISSING_PARAMS', message: 'centerId, produceId, date, and quantity are required' },
            });
        }
        const qty = parseFloat(quantity);
        const recommendations = await (0, slotAllocator_1.getRecommendedSlots)(centerId, produceId, date, qty);
        return res.json({
            success: true,
            data: recommendations,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
}
