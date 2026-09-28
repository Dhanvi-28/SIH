import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getQueueStatusForToken, recalculateCenterQueue } from '../services/queueEngine';
import { BookingStatus, ProcurementStatus } from '../types/enums';

const prisma = new PrismaClient();

export async function getQueueByToken(req: Request, res: Response) {
  try {
    const { token } = req.params;
    const status = await getQueueStatusForToken(token);

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
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

export async function markArrival(req: Request, res: Response) {
  try {
    const { token } = req.params;
    const booking = await prisma.booking.findUnique({
      where: { tokenNumber: token },
      include: { farmer: { include: { user: true } }, center: true },
    });

    if (!booking) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Token not found' } });
    }

    // A booking that already finished (or was cancelled) must never re-enter the queue,
    // otherwise re-marking arrival would regress a paid procurement back to ARRIVED.
    if ([BookingStatus.COMPLETED, BookingStatus.CANCELLED, BookingStatus.NO_SHOW].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATE',
          message: `This booking is already ${booking.status.toLowerCase()} and cannot be marked as arrived.`,
        },
      });
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: BookingStatus.ARRIVED },
    });

    const existingQueue = await prisma.queueEntry.findUnique({ where: { bookingId: booking.id } });
    if (!existingQueue) {
      const activeCount = await prisma.queueEntry.count({
        where: {
          booking: { centerId: booking.centerId },
          status: { in: [BookingStatus.ARRIVED, BookingStatus.WAITING, BookingStatus.CALLED, BookingStatus.PROCESSING] },
        },
      });

      await prisma.queueEntry.create({
        data: {
          bookingId: booking.id,
          position: activeCount + 1,
          status: BookingStatus.ARRIVED,
          estimatedWaitMinutes: (activeCount + 1) * 7,
          arrivedAt: new Date(),
        },
      });
    } else {
      await prisma.queueEntry.update({
        where: { id: existingQueue.id },
        data: { status: BookingStatus.ARRIVED, arrivedAt: new Date() },
      });
    }

    const existingProc = await prisma.procurement.findUnique({ where: { bookingId: booking.id } });
    if (!existingProc) {
      await prisma.procurement.create({
        data: {
          bookingId: booking.id,
          status: ProcurementStatus.ARRIVED,
        },
      });
    } else if (existingProc.status === ProcurementStatus.PENDING) {
      // Only advance a procurement that has not progressed past arrival.
      await prisma.procurement.update({
        where: { id: existingProc.id },
        data: { status: ProcurementStatus.ARRIVED },
      });
    }

    await recalculateCenterQueue(booking.centerId);

    await prisma.notification.create({
      data: {
        userId: booking.farmer.userId,
        type: 'QUEUE_UPDATE',
        title: 'Arrival Verified',
        message: `Arrival verified at ${booking.center.name}. You are now in the active queue.`,
      },
    });

    const updatedStatus = await getQueueStatusForToken(token);
    return res.json({ success: true, data: updatedStatus, message: 'Arrival verified' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

export async function callFarmer(req: Request, res: Response) {
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
      data: { status: BookingStatus.CALLED },
    });

    await prisma.queueEntry.updateMany({
      where: { bookingId: booking.id },
      data: { status: BookingStatus.CALLED, calledAt: new Date() },
    });

    await prisma.notification.create({
      data: {
        userId: booking.farmer.userId,
        type: 'COUNTER_ALERT',
        title: 'Your Token Called!',
        message: `Token ${token}: Please proceed to Counter ${counterNumber || 1} immediately for produce inspection.`,
      },
    });

    await recalculateCenterQueue(booking.centerId);
    const updatedStatus = await getQueueStatusForToken(token);
    return res.json({ success: true, data: updatedStatus, message: 'Farmer called' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

export async function startProcessing(req: Request, res: Response) {
  try {
    const { token } = req.params;
    const booking = await prisma.booking.findUnique({ where: { tokenNumber: token } });
    if (!booking) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Token not found' } });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: BookingStatus.PROCESSING },
    });

    await prisma.queueEntry.updateMany({
      where: { bookingId: booking.id },
      data: { status: BookingStatus.PROCESSING, startedAt: new Date() },
    });

    await recalculateCenterQueue(booking.centerId);
    const updatedStatus = await getQueueStatusForToken(token);
    return res.json({ success: true, data: updatedStatus });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

export async function completeQueue(req: Request, res: Response) {
  try {
    const { token } = req.params;
    const booking = await prisma.booking.findUnique({ where: { tokenNumber: token } });
    if (!booking) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Token not found' } });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: BookingStatus.COMPLETED },
    });

    await prisma.queueEntry.updateMany({
      where: { bookingId: booking.id },
      data: { status: BookingStatus.COMPLETED, completedAt: new Date() },
    });

    await recalculateCenterQueue(booking.centerId);
    return res.json({ success: true, message: 'Queue item completed' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

export async function markNoShow(req: Request, res: Response) {
  try {
    const { token } = req.params;
    const booking = await prisma.booking.findUnique({ where: { tokenNumber: token } });
    if (!booking) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Token not found' } });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: BookingStatus.NO_SHOW },
    });

    await prisma.queueEntry.updateMany({
      where: { bookingId: booking.id },
      data: { status: BookingStatus.NO_SHOW },
    });

    await recalculateCenterQueue(booking.centerId);
    return res.json({ success: true, message: 'Marked as no-show' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}
