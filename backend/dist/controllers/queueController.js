"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQueueByToken = getQueueByToken;
exports.markArrival = markArrival;
exports.callFarmer = callFarmer;
exports.startProcessing = startProcessing;
exports.completeQueue = completeQueue;
exports.markNoShow = markNoShow;
const client_1 = require("@prisma/client");
const queueEngine_1 = require("../services/queueEngine");
const enums_1 = require("../types/enums");
const prisma = new client_1.PrismaClient();
async function getQueueByToken(req, res) {
    try {
        const { token } = req.params;
        const status = await (0, queueEngine_1.getQueueStatusForToken)(token);
        if (!status) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Token not found' },
            });
        }
        return res.json({
            success: true,
            data: status,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
}
async function markArrival(req, res) {
    try {
        const { token } = req.params;
        const booking = await prisma.booking.findUnique({
            where: { tokenNumber: token },
            include: { farmer: { include: { user: true } }, center: true },
        });
        if (!booking) {
            return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Token not found' } });
        }
        await prisma.booking.update({
            where: { id: booking.id },
            data: { status: enums_1.BookingStatus.ARRIVED },
        });
        const existingQueue = await prisma.queueEntry.findUnique({ where: { bookingId: booking.id } });
        if (!existingQueue) {
            const activeCount = await prisma.queueEntry.count({
                where: {
                    booking: { centerId: booking.centerId },
                    status: { in: [enums_1.BookingStatus.ARRIVED, enums_1.BookingStatus.WAITING, enums_1.BookingStatus.CALLED, enums_1.BookingStatus.PROCESSING] },
                },
            });
            await prisma.queueEntry.create({
                data: {
                    bookingId: booking.id,
                    position: activeCount + 1,
                    status: enums_1.BookingStatus.ARRIVED,
                    estimatedWaitMinutes: (activeCount + 1) * 7,
                    arrivedAt: new Date(),
                },
            });
        }
        else {
            await prisma.queueEntry.update({
                where: { id: existingQueue.id },
                data: { status: enums_1.BookingStatus.ARRIVED, arrivedAt: new Date() },
            });
        }
        const existingProc = await prisma.procurement.findUnique({ where: { bookingId: booking.id } });
        if (!existingProc) {
            await prisma.procurement.create({
                data: {
                    bookingId: booking.id,
                    status: enums_1.ProcurementStatus.ARRIVED,
                },
            });
        }
        else {
            await prisma.procurement.update({
                where: { id: existingProc.id },
                data: { status: enums_1.ProcurementStatus.ARRIVED },
            });
        }
        await (0, queueEngine_1.recalculateCenterQueue)(booking.centerId);
        await prisma.notification.create({
            data: {
                userId: booking.farmer.userId,
                type: 'QUEUE_UPDATE',
                title: 'Arrival Verified',
                message: `Arrival verified at ${booking.center.name}. You are now in the active queue.`,
            },
        });
        const updatedStatus = await (0, queueEngine_1.getQueueStatusForToken)(token);
        return res.json({ success: true, data: updatedStatus, message: 'Arrival verified' });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
}
async function callFarmer(req, res) {
    try {
        const { token } = req.params;
        const { counterNumber } = req.body;
        const booking = await prisma.booking.findUnique({
            where: { tokenNumber: token },
            include: { farmer: { include: { user: true } } },
        });
        if (!booking) {
            return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Token not found' } });
        }
        await prisma.booking.update({
            where: { id: booking.id },
            data: { status: enums_1.BookingStatus.CALLED },
        });
        await prisma.queueEntry.updateMany({
            where: { bookingId: booking.id },
            data: { status: enums_1.BookingStatus.CALLED, calledAt: new Date() },
        });
        await prisma.notification.create({
            data: {
                userId: booking.farmer.userId,
                type: 'COUNTER_ALERT',
                title: 'Your Token Called!',
                message: `Token ${token}: Please proceed to Counter ${counterNumber || 1} immediately for produce inspection.`,
            },
        });
        await (0, queueEngine_1.recalculateCenterQueue)(booking.centerId);
        const updatedStatus = await (0, queueEngine_1.getQueueStatusForToken)(token);
        return res.json({ success: true, data: updatedStatus, message: 'Farmer called' });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
}
async function startProcessing(req, res) {
    try {
        const { token } = req.params;
        const booking = await prisma.booking.findUnique({ where: { tokenNumber: token } });
        if (!booking)
            return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Token not found' } });
        await prisma.booking.update({
            where: { id: booking.id },
            data: { status: enums_1.BookingStatus.PROCESSING },
        });
        await prisma.queueEntry.updateMany({
            where: { bookingId: booking.id },
            data: { status: enums_1.BookingStatus.PROCESSING, startedAt: new Date() },
        });
        await (0, queueEngine_1.recalculateCenterQueue)(booking.centerId);
        const updatedStatus = await (0, queueEngine_1.getQueueStatusForToken)(token);
        return res.json({ success: true, data: updatedStatus });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
}
async function completeQueue(req, res) {
    try {
        const { token } = req.params;
        const booking = await prisma.booking.findUnique({ where: { tokenNumber: token } });
        if (!booking)
            return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Token not found' } });
        await prisma.booking.update({
            where: { id: booking.id },
            data: { status: enums_1.BookingStatus.COMPLETED },
        });
        await prisma.queueEntry.updateMany({
            where: { bookingId: booking.id },
            data: { status: enums_1.BookingStatus.COMPLETED, completedAt: new Date() },
        });
        await (0, queueEngine_1.recalculateCenterQueue)(booking.centerId);
        return res.json({ success: true, message: 'Queue item completed' });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
}
async function markNoShow(req, res) {
    try {
        const { token } = req.params;
        const booking = await prisma.booking.findUnique({ where: { tokenNumber: token } });
        if (!booking)
            return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Token not found' } });
        await prisma.booking.update({
            where: { id: booking.id },
            data: { status: enums_1.BookingStatus.NO_SHOW },
        });
        await prisma.queueEntry.updateMany({
            where: { bookingId: booking.id },
            data: { status: enums_1.BookingStatus.NO_SHOW },
        });
        await (0, queueEngine_1.recalculateCenterQueue)(booking.centerId);
        return res.json({ success: true, message: 'Marked as no-show' });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
}
