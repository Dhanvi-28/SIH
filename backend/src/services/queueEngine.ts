import { PrismaClient } from '@prisma/client';
import { predictWaitingTime } from './mlService';
import { BookingStatus } from '../types/enums';

const prisma = new PrismaClient();

export async function recalculateCenterQueue(centerId: string) {
  const queueEntries = await prisma.queueEntry.findMany({
    where: {
      booking: { centerId },
      status: { in: [BookingStatus.ARRIVED, BookingStatus.WAITING, BookingStatus.CALLED, BookingStatus.PROCESSING] },
    },
    include: {
      booking: true,
    },
    orderBy: [
      { arrivedAt: 'asc' },
    ],
  });

  const center = await prisma.procurementCenter.findUnique({
    where: { id: centerId },
  });

  const activeCounters = center?.activeCounters || 4;

  let activePosition = 1;
  for (const entry of queueEntries) {
    if (entry.status === BookingStatus.PROCESSING) {
      await prisma.queueEntry.update({
        where: { id: entry.id },
        data: { position: 0, estimatedWaitMinutes: 0 },
      });
    } else {
      const farmersAhead = activePosition - 1;
      const prediction = await predictWaitingTime({
        centerId,
        farmersAhead,
        queueSize: queueEntries.length,
        totalQuantityAhead: farmersAhead * 18,
        farmerQuantity: entry.booking.quantity,
        averageProcessingMinutes: 7.5,
        activeCounters,
        centerCapacity: center?.dailyCapacity || 1000,
        expectedArrivals: queueEntries.length,
        hourOfDay: new Date().getHours(),
      });

      await prisma.queueEntry.update({
        where: { id: entry.id },
        data: {
          position: activePosition,
          estimatedWaitMinutes: prediction.predictedMinutes,
        },
      });

      activePosition++;
    }
  }
}

export async function getQueueStatusForToken(tokenNumber: string) {
  const booking = await prisma.booking.findUnique({
    where: { tokenNumber },
    include: {
      farmer: { include: { user: true } },
      center: true,
      produce: true,
      slot: true,
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
    return null;
  }

  const servingEntry = await prisma.queueEntry.findFirst({
    where: {
      booking: { centerId: booking.centerId },
      status: { in: [BookingStatus.PROCESSING, BookingStatus.CALLED] },
    },
    include: { booking: true },
    orderBy: { calledAt: 'desc' },
  });

  const totalInQueue = await prisma.queueEntry.count({
    where: {
      booking: { centerId: booking.centerId },
      status: { in: [BookingStatus.ARRIVED, BookingStatus.WAITING, BookingStatus.CALLED, BookingStatus.PROCESSING] },
    },
  });

  const farmersAhead = booking.queueEntry ? Math.max(0, booking.queueEntry.position - 1) : 0;

  const prediction = await predictWaitingTime({
    centerId: booking.centerId,
    farmersAhead,
    queueSize: totalInQueue,
    totalQuantityAhead: farmersAhead * 18,
    farmerQuantity: booking.quantity,
    averageProcessingMinutes: 7.5,
    activeCounters: booking.center.activeCounters,
    centerCapacity: booking.center.dailyCapacity,
    expectedArrivals: totalInQueue,
    hourOfDay: new Date().getHours(),
  });

  return {
    booking,
    nowServingToken: servingEntry?.booking?.tokenNumber || 'Counter Opening',
    farmersAhead,
    queuePosition: booking.queueEntry?.position || 1,
    estimatedWaitMinutes: prediction.predictedMinutes,
    minMinutes: prediction.minMinutes,
    maxMinutes: prediction.maxMinutes,
    confidence: prediction.confidence,
    factors: prediction.factors,
    activeCounters: booking.center.activeCounters,
  };
}
