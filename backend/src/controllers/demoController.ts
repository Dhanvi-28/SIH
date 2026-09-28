import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { recalculateCenterQueue } from '../services/queueEngine';
import { BookingStatus, ProcurementStatus } from '../types/enums';

const prisma = new PrismaClient();

export async function advanceQueue(req: Request, res: Response) {
  try {
    const { centerId } = req.body;
    const targetCenterId = centerId || (await prisma.procurementCenter.findFirst())?.id;

    if (!targetCenterId) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Center not found' } });
    }

    const nextEntry = await prisma.queueEntry.findFirst({
      where: {
        booking: { centerId: targetCenterId },
        status: { in: [BookingStatus.ARRIVED, BookingStatus.WAITING] },
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
        status: BookingStatus.PROCESSING,
      },
      data: { status: BookingStatus.COMPLETED },
    });

    await prisma.booking.update({
      where: { id: nextEntry.bookingId },
      data: { status: BookingStatus.CALLED },
    });

    await prisma.queueEntry.update({
      where: { id: nextEntry.id },
      data: { status: BookingStatus.CALLED, calledAt: new Date() },
    });

    await recalculateCenterQueue(targetCenterId);

    return res.json({
      success: true,
      message: `Queue advanced! Called token ${nextEntry.booking.tokenNumber}.`,
      calledToken: nextEntry.booking.tokenNumber,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

export async function toggleCounters(req: Request, res: Response) {
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

    await recalculateCenterQueue(center.id);

    return res.json({
      success: true,
      data: updated,
      message: `Active counters updated to ${updated.activeCounters}`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

export async function resetRameshToken(req: Request, res: Response) {
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
      data: { status: BookingStatus.ARRIVED },
    });

    await prisma.queueEntry.upsert({
      where: { bookingId: rameshBooking.id },
      create: {
        bookingId: rameshBooking.id,
        position: 6,
        status: BookingStatus.ARRIVED,
        estimatedWaitMinutes: 42,
        arrivedAt: new Date(),
      },
      update: {
        position: 6,
        status: BookingStatus.ARRIVED,
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
        data: { status: ProcurementStatus.ARRIVED, actualQuantity: null, rejectionReason: null },
      });
    }

    await recalculateCenterQueue(rameshBooking.centerId);

    return res.json({
      success: true,
      message: 'Token KPC-041 reset to ARRIVED state for full demo repeat!',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}
