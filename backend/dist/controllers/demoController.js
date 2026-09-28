"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.advanceQueue = advanceQueue;
exports.toggleCounters = toggleCounters;
exports.resetRameshToken = resetRameshToken;
const client_1 = require("@prisma/client");
const queueEngine_1 = require("../services/queueEngine");
const enums_1 = require("../types/enums");
const prisma = new client_1.PrismaClient();
async function advanceQueue(req, res) {
    try {
        const { centerId } = req.body;
        const targetCenterId = centerId || (await prisma.procurementCenter.findFirst())?.id;
        if (!targetCenterId) {
            return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Center not found' } });
        }
        const nextEntry = await prisma.queueEntry.findFirst({
            where: {
                booking: { centerId: targetCenterId },
                status: { in: [enums_1.BookingStatus.ARRIVED, enums_1.BookingStatus.WAITING] },
            },
            include: { booking: true },
            orderBy: { position: 'asc' },
        });
        if (!nextEntry) {
            return res.json({ success: true, message: 'No more farmers in queue to advance' });
        }
        await prisma.queueEntry.updateMany({
            where: {
                booking: { centerId: targetCenterId },
                status: enums_1.BookingStatus.PROCESSING,
            },
            data: { status: enums_1.BookingStatus.COMPLETED },
        });
        await prisma.booking.update({
            where: { id: nextEntry.bookingId },
            data: { status: enums_1.BookingStatus.CALLED },
        });
        await prisma.queueEntry.update({
            where: { id: nextEntry.id },
            data: { status: enums_1.BookingStatus.CALLED, calledAt: new Date() },
        });
        await (0, queueEngine_1.recalculateCenterQueue)(targetCenterId);
        return res.json({
            success: true,
            message: `Queue advanced! Called token ${nextEntry.booking.tokenNumber}.`,
            calledToken: nextEntry.booking.tokenNumber,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
}
async function toggleCounters(req, res) {
    try {
        const { centerId, activeCounters } = req.body;
        const center = await prisma.procurementCenter.findFirst({
            where: centerId ? { id: centerId } : {},
        });
        if (!center) {
            return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Center not found' } });
        }
        const updated = await prisma.procurementCenter.update({
            where: { id: center.id },
            data: { activeCounters: Math.max(1, activeCounters || 4) },
        });
        await (0, queueEngine_1.recalculateCenterQueue)(center.id);
        return res.json({
            success: true,
            data: updated,
            message: `Active counters updated to ${updated.activeCounters}`,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
}
async function resetRameshToken(req, res) {
    try {
        const rameshBooking = await prisma.booking.findUnique({
            where: { tokenNumber: 'KPC-041' },
            include: { procurement: true },
        });
        if (!rameshBooking) {
            return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Token KPC-041 not found' } });
        }
        await prisma.booking.update({
            where: { id: rameshBooking.id },
            data: { status: enums_1.BookingStatus.ARRIVED },
        });
        await prisma.queueEntry.upsert({
            where: { bookingId: rameshBooking.id },
            create: {
                bookingId: rameshBooking.id,
                position: 6,
                status: enums_1.BookingStatus.ARRIVED,
                estimatedWaitMinutes: 42,
                arrivedAt: new Date(),
            },
            update: {
                position: 6,
                status: enums_1.BookingStatus.ARRIVED,
                estimatedWaitMinutes: 42,
                arrivedAt: new Date(),
            },
        });
        if (rameshBooking.procurement) {
            await prisma.payment.deleteMany({ where: { procurementId: rameshBooking.procurement.id } });
            await prisma.weighing.deleteMany({ where: { procurementId: rameshBooking.procurement.id } });
            await prisma.inspection.deleteMany({ where: { procurementId: rameshBooking.procurement.id } });
            await prisma.procurement.update({
                where: { id: rameshBooking.procurement.id },
                data: { status: enums_1.ProcurementStatus.ARRIVED, actualQuantity: null, rejectionReason: null },
            });
        }
        await (0, queueEngine_1.recalculateCenterQueue)(rameshBooking.centerId);
        return res.json({
            success: true,
            message: 'Token KPC-041 reset to ARRIVED state for full demo repeat!',
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
}
