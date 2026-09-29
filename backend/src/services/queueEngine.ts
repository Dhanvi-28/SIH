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

  // Single source of truth for the live queue.
  // Stored `position` values can be stale (they are only refreshed on state transitions),
  // so the same deterministic rule used by recalculateCenterQueue is applied here:
  // order by arrival time, with any PROCESSING token sitting at the counter (position 0).
  const liveQueue = await prisma.queueEntry.findMany({
    where: {
      booking: { centerId: booking.centerId },
      status: { in: [BookingStatus.ARRIVED, BookingStatus.WAITING, BookingStatus.CALLED, BookingStatus.PROCESSING] },
    },
    include: { booking: { select: { id: true, tokenNumber: true, quantity: true } } },
    orderBy: { arrivedAt: 'asc' },
  });

  const totalInQueue = liveQueue.length;

  let position = 0;
  const orderedQueue = liveQueue.map((entry) => ({
    ...entry,
    livePosition: entry.status === BookingStatus.PROCESSING ? 0 : ++position,
  }));

  const myIndex = orderedQueue.findIndex((e) => e.booking.id === booking.id);
  const myPosition = myIndex === -1 ? 0 : orderedQueue[myIndex].livePosition;

  // Tokens physically at the counters right now.
  const servingTokens = orderedQueue
    .filter((e) => e.livePosition === 0 || e.status === BookingStatus.CALLED || e.status === BookingStatus.PROCESSING)
    .map((e) => ({
      tokenNumber: e.booking.tokenNumber,
      status: e.status,
      position: e.livePosition,
    }));

  // Real tokens between the counter and this farmer, nearest to the counter first.
  const aheadTokens = (myIndex === -1 ? [] : orderedQueue.slice(0, myIndex))
    .filter((e) => e.livePosition > 0)
    .map((e) => ({
      tokenNumber: e.booking.tokenNumber,
      quantity: e.booking.quantity,
      position: e.livePosition,
    }));

  // A farmer who has not checked in yet is not in the queue, so nothing is "ahead" of them.
  const farmersAhead = aheadTokens.length;

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
    queuePosition: myIndex === -1 ? (booking.queueEntry?.position ?? 1) : myPosition,
    servingTokens,
    aheadTokens,
    totalInQueue,
    estimatedWaitMinutes: prediction.predictedMinutes,
    minMinutes: prediction.minMinutes,
    maxMinutes: prediction.maxMinutes,
    confidence: prediction.confidence,
    factors: prediction.factors,
    activeCounters: booking.center.activeCounters,
  };
}
