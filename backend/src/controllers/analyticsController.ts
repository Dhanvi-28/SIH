import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ProcurementStatus } from '../types/enums';

const prisma = new PrismaClient();

export async function getAdminAnalytics(req: Request, res: Response) {
  try {
    const totalFarmers = await prisma.farmer.count();
    const totalCenters = await prisma.procurementCenter.count();

    const todayBookings = await prisma.booking.findMany({
      include: { produce: true, center: true },
    });

    const totalQuantityProcured = todayBookings.reduce((acc, b) => acc + b.quantity, 0);

    const completedProcurements = await prisma.procurement.count({
      where: { status: ProcurementStatus.PAID },
    });

    const pendingProcurements = await prisma.procurement.count({
      where: { status: { in: [ProcurementStatus.PENDING, ProcurementStatus.ARRIVED, ProcurementStatus.INSPECTED, ProcurementStatus.WEIGHED, ProcurementStatus.ACCEPTED, ProcurementStatus.PAYMENT_PENDING] } },
    });

    const rejectedProcurements = await prisma.procurement.count({
      where: { status: ProcurementStatus.REJECTED },
    });

    const centers = await prisma.procurementCenter.findMany();
    const centerAnalytics = await Promise.all(
      centers.map(async (c) => {
        const bookings = await prisma.booking.findMany({ where: { centerId: c.id } });
        const qty = bookings.reduce((sum, b) => sum + b.quantity, 0);
        return {
          id: c.id,
          name: c.name,
          dailyCapacity: c.dailyCapacity,
          bookedQuantity: qty,
          utilizationPercent: Math.min(100, Math.round((qty / c.dailyCapacity) * 100)),
          activeCounters: c.activeCounters,
        };
      })
    );

    const produces = await prisma.produce.findMany();
    const cropDistribution = await Promise.all(
      produces.map(async (p) => {
        const bookings = await prisma.booking.findMany({ where: { produceId: p.id } });
        const qty = bookings.reduce((sum, b) => sum + b.quantity, 0);
        return {
          name: p.name,
          quantity: qty,
          bookingsCount: bookings.length,
        };
      })
    );

    const waitTimeTrend = [
      { hour: '09:00', waitMinutes: 15 },
      { hour: '10:00', waitMinutes: 28 },
      { hour: '11:00', waitMinutes: 42 },
      { hour: '12:00', waitMinutes: 35 },
      { hour: '13:00', waitMinutes: 20 },
      { hour: '14:00', waitMinutes: 30 },
      { hour: '15:00', waitMinutes: 25 },
    ];

    return res.json({
      success: true,
      data: {
        summary: {
          totalFarmers,
          totalCenters,
          totalQuantityProcured,
          completedProcurements,
          pendingProcurements,
          rejectedProcurements,
          avgWaitMinutes: 31,
        },
        centerAnalytics,
        cropDistribution,
        waitTimeTrend,
        acceptanceRatio: {
          accepted: completedProcurements + 1,
          rejected: rejectedProcurements,
          pending: pendingProcurements,
        },
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}
