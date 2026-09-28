import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { recalculateCenterQueue } from '../services/queueEngine';
import { BookingStatus, ProcurementStatus } from '../types/enums';

const prisma = new PrismaClient();

/**
 * Generates the next sequential digital token for a center prefix (e.g. KPC-042).
 * Scans existing tokens so a collision on the @unique constraint is impossible,
 * even after repeated demo runs.
 */
async function generateTokenNumber(prefix: string): Promise<string> {
  const existing = await prisma.booking.findMany({
    where: { tokenNumber: { startsWith: `${prefix}-` } },
    select: { tokenNumber: true },
  });

  const highest = existing.reduce((max, b) => {
    const num = parseInt(b.tokenNumber.split('-')[1], 10);
    return Number.isNaN(num) ? max : Math.max(max, num);
  }, 0);

  const taken = new Set(existing.map((b) => b.tokenNumber));
  let candidate = highest + 1;
  while (taken.has(`${prefix}-${String(candidate).padStart(3, '0')}`)) {
    candidate += 1;
  }
  return `${prefix}-${String(candidate).padStart(3, '0')}`;
}

export async function createBooking(req: AuthRequest, res: Response) {
  try {
    if (!req.user || !req.user.farmerId) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only registered farmers can book slots' },
      });
    }

    const { centerId, produceId, slotId, quantity } = req.body;

    if (!centerId || !produceId || !slotId || !quantity || parseFloat(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Center, produce, slot and a positive quantity are required' },
      });
    }

    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: { schedule: { include: { center: true } } },
    });

    if (!slot) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Slot not found' } });
    }

    // The schedule always derives from the slot, so a stale/mismatched client payload
    // can never create an inconsistent booking.
    const schedule = slot.schedule;

    if (schedule.centerId !== centerId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Selected slot does not belong to the chosen center' },
      });
    }

    if (schedule.produceId !== produceId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Selected slot is not scheduled for the chosen crop' },
      });
    }

    if (slot.status === 'CLOSED' || schedule.status === 'CLOSED') {
      return res.status(400).json({
        success: false,
        error: { code: 'SLOT_CLOSED', message: 'This slot is closed for bookings' },
      });
    }

    const qty = parseFloat(quantity);

    if (slot.bookedQuantity + qty > slot.capacity) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'SLOT_FULL',
          message: `Only ${Math.max(0, slot.capacity - slot.bookedQuantity)} Tons remain in the ${slot.startTime} slot. Please reduce quantity or pick another slot.`,
        },
      });
    }

    if (schedule.bookedQuantity + qty > schedule.capacity) {
      return res.status(400).json({
        success: false,
        error: { code: 'SCHEDULE_FULL', message: 'Daily schedule capacity for this crop is already full.' },
      });
    }

    const centerPrefix = (schedule.center.code || 'KPC').split('-')[0].toUpperCase();
    const tokenNumber = await generateTokenNumber(centerPrefix);

    const booking = await prisma.booking.create({
      data: {
        farmerId: req.user.farmerId,
        centerId: schedule.centerId,
        produceId: schedule.produceId,
        scheduleId: schedule.id,
        slotId: slot.id,
        quantity: qty,
        tokenNumber,
        status: BookingStatus.BOOKED,
        procurement: {
          create: { status: ProcurementStatus.PENDING },
        },
      },
      include: {
        farmer: { include: { user: true } },
        center: true,
        produce: true,
        slot: true,
        schedule: true,
        queueEntry: true,
        procurement: true,
      },
    });

    await prisma.slot.update({
      where: { id: slot.id },
      data: {
        bookedCount: { increment: 1 },
        bookedQuantity: { increment: qty },
      },
    });

    await prisma.procurementSchedule.update({
      where: { id: schedule.id },
      data: {
        bookedQuantity: { increment: qty },
      },
    });

    await prisma.notification.create({
      data: {
        userId: req.user.id,
        type: 'SLOT_REMINDER',
        title: 'Booking Confirmed!',
        message: `Your booking at ${schedule.center.name} is confirmed for ${schedule.date} at ${slot.startTime}. Digital Token: ${tokenNumber}.`,
      },
    });

    return res.status(201).json({
      success: true,
      data: booking,
      message: 'Booking created successfully',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

export async function getBookings(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
    }

    const whereClause = req.user.role === 'FARMER' ? { farmerId: req.user.farmerId } : {};

    const bookings = await prisma.booking.findMany({
      where: whereClause,
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
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: bookings });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

export async function getBookingById(req: Request, res: Response) {
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
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

export async function cancelBooking(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Booking not found' } });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
    });

    // Release the reserved capacity back to the slot and daily schedule
    await prisma.slot.update({
      where: { id: booking.slotId },
      data: {
        bookedCount: { decrement: 1 },
        bookedQuantity: { decrement: booking.quantity },
      },
    });

    await prisma.procurementSchedule.update({
      where: { id: booking.scheduleId },
      data: { bookedQuantity: { decrement: booking.quantity } },
    });

    await prisma.queueEntry.deleteMany({ where: { bookingId: id } });
    await recalculateCenterQueue(booking.centerId);

    return res.json({ success: true, data: updated, message: 'Booking cancelled' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}
