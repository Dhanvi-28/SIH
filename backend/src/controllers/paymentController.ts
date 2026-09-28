import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { PaymentStatus, ProcurementStatus, BookingStatus } from '../types/enums';

const prisma = new PrismaClient();

export async function getPayments(req: AuthRequest, res: Response) {
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
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

export async function processPayment(req: AuthRequest, res: Response) {
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
        status: PaymentStatus.PAID,
        processedAt: new Date(),
      },
    });

    await prisma.procurement.update({
      where: { id: payment.procurementId },
      data: { status: ProcurementStatus.PAID },
    });

    await prisma.booking.update({
      where: { id: payment.procurement.bookingId },
      data: { status: BookingStatus.COMPLETED },
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
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}
