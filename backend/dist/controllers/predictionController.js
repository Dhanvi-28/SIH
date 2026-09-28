"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrediction = getPrediction;
const mlService_1 = require("../services/mlService");
async function getPrediction(req, res) {
    try {
        const { centerId, farmersAhead, queueSize, totalQuantityAhead, farmerQuantity, averageProcessingMinutes, activeCounters, centerCapacity, expectedArrivals, hourOfDay, } = req.body;
        const prediction = await (0, mlService_1.predictWaitingTime)({
            centerId: centerId || 'default-center',
            farmersAhead: farmersAhead || 6,
            queueSize: queueSize || 7,
            totalQuantityAhead: totalQuantityAhead || 100,
            farmerQuantity: farmerQuantity || 24,
            averageProcessingMinutes: averageProcessingMinutes || 7.5,
            activeCounters: activeCounters || 4,
            centerCapacity: centerCapacity || 1000,
            expectedArrivals: expectedArrivals || 120,
            hourOfDay: hourOfDay || new Date().getHours(),
        });
        return res.json({
            success: true,
            data: prediction,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
}
