"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPayments = getPayments;
exports.processPayment = processPayment;
const client_1 = require("@prisma/client");
const enums_1 = require("../types/enums");
const prisma = new client_1.PrismaClient();
async function getPayments(req, res) {
    try {
        const payments = await prisma.payment.findMany({
            include: {
                procurement: {
                    include: {
                        booking: {
                            include: {
                                farmer: { include: { user: true } },
                                center: true,
                                produce: true,
                            },
                        },
                    },
                },
            },
            orderBy: { id: 'desc' },
        });
        return res.json({ success: true, data: payments });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
}
async function processPayment(req, res) {
    try {
        const { id } = req.params;
        const payment = await prisma.payment.findUnique({
            where: { id },
            include: {
                procurement: {
                    include: { booking: { include: { farmer: true, center: true, produce: true } } },
                },
            },
        });
        if (!payment) {
            return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Payment record not found' } });
        }
        const updatedPayment = await prisma.payment.update({
            where: { id },
            data: {
                status: enums_1.PaymentStatus.PAID,
                processedAt: new Date(),
            },
        });
        await prisma.procurement.update({
            where: { id: payment.procurementId },
            data: { status: enums_1.ProcurementStatus.PAID },
        });
        await prisma.booking.update({
            where: { id: payment.procurement.bookingId },
            data: { status: enums_1.BookingStatus.COMPLETED },
        });
        await prisma.notification.create({
            data: {
                userId: payment.procurement.booking.farmer.userId,
                type: 'PAYMENT',
                title: 'Payment Direct Payout Successful!',
                message: `₹${payment.netAmount.toLocaleString('en-IN')} has been transferred directly to your bank account. Ref: ${payment.reference}.`,
            },
        });
        return res.json({
            success: true,
            data: updatedPayment,
            message: 'Payment payout processed successfully',
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
}
