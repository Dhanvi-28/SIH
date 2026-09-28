import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { BookingStatus } from '../types/enums';

const prisma = new PrismaClient();

export async function getCenters(req: Request, res: Response) {
  try {
    const centers = await prisma.procurementCenter.findMany({
      include: {
        centerProduces: {
          include: { produce: true },
        },
      },
    });

    const enrichedCenters = await Promise.all(
      centers.map(async (center) => {
        const todayStr = new Date().toISOString().split('T')[0];
        const schedules = await prisma.procurementSchedule.findMany({
          where: { centerId: center.id, date: todayStr },
          select: { bookedQuantity: true },
        });

        // Sum across every crop scheduled today for this center
        const bookedQuantity = schedules.reduce((sum, s) => sum + s.bookedQuantity, 0);
        const remainingCapacity = Math.max(0, center.dailyCapacity - bookedQuantity);

        const currentQueue = await prisma.queueEntry.count({
          where: {
            booking: { centerId: center.id },
            status: { in: [BookingStatus.ARRIVED, BookingStatus.WAITING, BookingStatus.CALLED, BookingStatus.PROCESSING] },
          },
        });

        const activeBookings = await prisma.booking.count({
          where: {
            centerId: center.id,
            status: { notIn: [BookingStatus.CANCELLED, BookingStatus.NO_SHOW] },
          },
        });

        return {
          ...center,
          todayBookedQuantity: Math.round(bookedQuantity * 10) / 10,
          remainingCapacity: Math.round(remainingCapacity * 10) / 10,
          capacityUtilizationPercent: center.dailyCapacity > 0
            ? Math.round((bookedQuantity / center.dailyCapacity) * 100)
            : 0,
          currentQueue,
          totalBookings: activeBookings,
          avgProcessingSpeedMinutes: 7.5,
        };
      })
    );

    return res.json({
      success: true,
      data: enrichedCenters,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

export async function getCenterById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const center = await prisma.procurementCenter.findUnique({
      where: { id },
      include: {
        centerProduces: { include: { produce: true } },
        schedules: {
          include: { slots: true, produce: true },
          orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        },
      },
    });

    if (!center) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Center not found' } });
    }

    const currentQueue = await prisma.queueEntry.count({
      where: {
        booking: { centerId: id },
        status: { in: [BookingStatus.ARRIVED, BookingStatus.WAITING, BookingStatus.CALLED, BookingStatus.PROCESSING] },
      },
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const bookingDates = Array.from(
      new Set(center.schedules.map((s) => s.date).filter((d) => d >= todayStr))
    ).sort();

    return res.json({
      success: true,
      data: {
        ...center,
        currentQueue,
        bookingDates,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}
