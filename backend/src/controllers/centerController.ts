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
        const schedule = await prisma.procurementSchedule.findFirst({
          where: { centerId: center.id, date: todayStr },
        });

        const bookedQuantity = schedule?.bookedQuantity || 0;
        const remainingCapacity = Math.max(0, center.dailyCapacity - bookedQuantity);

        const currentQueue = await prisma.queueEntry.count({
          where: {
            booking: { centerId: center.id },
            status: { in: [BookingStatus.ARRIVED, BookingStatus.WAITING, BookingStatus.CALLED, BookingStatus.PROCESSING] },
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
        schedules: { include: { slots: true } },
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

    return res.json({
      success: true,
      data: {
        ...center,
        currentQueue,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}
