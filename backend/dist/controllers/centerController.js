"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCenters = getCenters;
exports.getCenterById = getCenterById;
const client_1 = require("@prisma/client");
const enums_1 = require("../types/enums");
const prisma = new client_1.PrismaClient();
async function getCenters(req, res) {
    try {
        const centers = await prisma.procurementCenter.findMany({
            include: {
                centerProduces: {
                    include: { produce: true },
                },
            },
        });
        const enrichedCenters = await Promise.all(centers.map(async (center) => {
            const todayStr = new Date().toISOString().split('T')[0];
            const schedule = await prisma.procurementSchedule.findFirst({
                where: { centerId: center.id, date: todayStr },
            });
            const bookedQuantity = schedule?.bookedQuantity || 0;
            const remainingCapacity = Math.max(0, center.dailyCapacity - bookedQuantity);
            const currentQueue = await prisma.queueEntry.count({
                where: {
                    booking: { centerId: center.id },
                    status: { in: [enums_1.BookingStatus.ARRIVED, enums_1.BookingStatus.WAITING, enums_1.BookingStatus.CALLED, enums_1.BookingStatus.PROCESSING] },
                },
            });
            return {
                ...center,
                todayBookedQuantity: bookedQuantity,
                remainingCapacity,
                capacityUtilizationPercent: Math.round((bookedQuantity / center.dailyCapacity) * 100),
                currentQueue,
                avgProcessingSpeedMinutes: 7.5,
            };
        }));
        return res.json({
            success: true,
            data: enrichedCenters,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
}
async function getCenterById(req, res) {
    try {
        const { id } = req.params;
        const center = await prisma.procurementCenter.findUnique({
            where: { id },
            include: {
                centerProduces: { include: { produce: true } },
                schedules: { include: { slots: true } },
            },
        });
        if (!center) {
            return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Center not found' } });
        }
        const currentQueue = await prisma.queueEntry.count({
            where: {
                booking: { centerId: id },
                status: { in: [enums_1.BookingStatus.ARRIVED, enums_1.BookingStatus.WAITING, enums_1.BookingStatus.CALLED, enums_1.BookingStatus.PROCESSING] },
            },
        });
        return res.json({
            success: true,
            data: {
                ...center,
                currentQueue,
            },
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
}
