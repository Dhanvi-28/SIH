"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBooking = createBooking;
exports.getBookings = getBookings;
exports.getBookingById = getBookingById;
exports.cancelBooking = cancelBooking;
const client_1 = require("@prisma/client");
const queueEngine_1 = require("../services/queueEngine");
const enums_1 = require("../types/enums");
const prisma = new client_1.PrismaClient();
async function createBooking(req, res) {
    try {
        if (!req.user || !req.user.farmerId) {
            return res.status(403).json({
                success: false,
                error: { code: 'FORBIDDEN', message: 'Only registered farmers can book slots' },
            });
        }
        const { centerId, produceId, scheduleId, slotId, quantity } = req.body;
        if (!centerId || !produceId || !scheduleId || !slotId || !quantity || quantity <= 0) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_INPUT', message: 'All booking fields and positive quantity are required' },
            });
        }
        const slot = await prisma.slot.findUnique({
            where: { id: slotId },
            include: { schedule: { include: { center: true } } },
        });
        if (!slot) {
            return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Slot not found' } });
        }
        if (slot.bookedQuantity + quantity > slot.capacity) {
            return res.status(400).json({
                success: false,
                error: { code: 'SLOT_FULL', message: 'This slot does not have sufficient capacity remaining.' },
            });
        }
        const centerCode = slot.schedule.center.code || 'KPC';
        const randomNum = Math.floor(40 + Math.random() * 50);
        const tokenNumber = `${centerCode.substring(0, 3)}-${randomNum}`;
        const booking = await prisma.booking.create({
            data: {
                farmerId: req.user.farmerId,
                centerId,
                produceId,
                scheduleId,
                slotId,
                quantity: parseFloat(quantity),
                tokenNumber,
                status: enums_1.BookingStatus.BOOKED,
            },
            include: {
                center: true,
                produce: true,
                slot: true,
                schedule: true,
            },
        });
        await prisma.slot.update({
            where: { id: slotId },
            data: {
                bookedCount: { increment: 1 },
                bookedQuantity: { increment: parseFloat(quantity) },
            },
        });
        await prisma.procurementSchedule.update({
            where: { id: scheduleId },
            data: {
                bookedQuantity: { increment: parseFloat(quantity) },
            },
        });
        await prisma.notification.create({
            data: {
                userId: req.user.id,
                type: 'SLOT_REMINDER',
                title: 'Booking Confirmed!',
                message: `Your booking at ${slot.schedule.center.name} is confirmed for ${booking.schedule.date} at ${slot.startTime}. Digital Token: ${tokenNumber}.`,
            },
        });
        return res.status(201).json({
            success: true,
            data: booking,
            message: 'Booking created successfully',
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
}
async function getBookings(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        }
        const whereClause = req.user.role === 'FARMER' ? { farmerId: req.user.farmerId } : {};
        const bookings = await prisma.booking.findMany({
            where: whereClause,
            include: {
                center: true,
                produce: true,
                slot: true,
                schedule: true,
                queueEntry: true,
                procurement: {
                    include: {
                        inspection: true,
                        weighing: true,
                        payment: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.json({ success: true, data: bookings });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
}
async function getBookingById(req, res) {
    try {
        const { id } = req.params;
        const booking = await prisma.booking.findUnique({
            where: { id },
            include: {
                farmer: { include: { user: true } },
                center: true,
                produce: true,
                slot: true,
                schedule: true,
                queueEntry: true,
                procurement: {
                    include: {
                        inspection: true,
                        weighing: true,
                        payment: true,
                    },
                },
            },
        });
        if (!booking) {
            return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Booking not found' } });
        }
        return res.json({ success: true, data: booking });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
}
async function cancelBooking(req, res) {
    try {
        const { id } = req.params;
        const booking = await prisma.booking.findUnique({ where: { id } });
        if (!booking) {
            return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Booking not found' } });
        }
        const updated = await prisma.booking.update({
            where: { id },
            data: { status: enums_1.BookingStatus.CANCELLED },
        });
        await prisma.queueEntry.deleteMany({ where: { bookingId: id } });
        await (0, queueEngine_1.recalculateCenterQueue)(booking.centerId);
        return res.json({ success: true, data: updated, message: 'Booking cancelled' });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
}
