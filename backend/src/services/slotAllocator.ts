import { PrismaClient } from '@prisma/client';
import { predictWaitingTime } from './mlService';

const prisma = new PrismaClient();

export interface SlotRecommendation {
  slotId: string;
  startTime: string;
  endTime: string;
  score: number;
  expectedWaitMinutes: number;
  crowdLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  capacityAvailable: boolean;
  reasons: string[];
}

export async function getRecommendedSlots(
  centerId: string,
  produceId: string,
  date: string,
  quantity: number
): Promise<SlotRecommendation[]> {
  // 1. Get center & schedule
  const center = await prisma.procurementCenter.findUnique({
    where: { id: centerId },
  });

  if (!center) {
    throw new Error('Procurement center not found');
  }

  const schedule = await prisma.procurementSchedule.findFirst({
    where: { centerId, produceId, date },
    include: { slots: true },
  });

  if (!schedule || schedule.slots.length === 0) {
    return [];
  }

  // 2. Fetch active counters & current queue count
  const activeCounters = center.activeCounters || 4;
  const currentQueueCount = await prisma.queueEntry.count({
    where: {
      booking: { centerId },
      status: { in: ['ARRIVED', 'WAITING', 'CALLED', 'PROCESSING'] },
    },
  });

  const recommendations: SlotRecommendation[] = [];

  for (const slot of schedule.slots) {
    // Check remaining capacity in slot
    const capacityAvailable = slot.bookedQuantity + quantity <= slot.capacity;
    
    // Call ML Prediction engine for slot context
    const hour = parseInt(slot.startTime.split(':')[0], 10) || 10;
    const prediction = await predictWaitingTime({
      centerId,
      farmersAhead: currentQueueCount + slot.bookedCount,
      queueSize: currentQueueCount + slot.bookedCount + 1,
      totalQuantityAhead: (currentQueueCount + slot.bookedCount) * 15, // estimated avg
      farmerQuantity: quantity,
      averageProcessingMinutes: 7.5,
      activeCounters,
      centerCapacity: center.dailyCapacity,
      expectedArrivals: schedule.bookedQuantity,
      hourOfDay: hour,
    });

    const expectedWaitMinutes = prediction.predictedMinutes;

    // Calculate score (0 to 100)
    // capacityAvailabilityScore (max 30)
    const capacityRatio = Math.max(0, 1 - (slot.bookedQuantity / slot.capacity));
    const capScore = capacityRatio * 30;

    // queueScore (max 30, lower wait time = higher score)
    const queueScore = Math.max(0, 30 - expectedWaitMinutes * 0.5);

    // crowdLevel & workload score (max 20)
    let crowdLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    let crowdScore = 20;
    if (slot.bookedCount >= 6) {
      crowdLevel = 'HIGH';
      crowdScore = 5;
    } else if (slot.bookedCount >= 3) {
      crowdLevel = 'MEDIUM';
      crowdScore = 12;
    }

    // historical efficiency score (max 20)
    const hourScore = (hour >= 9 && hour <= 11) ? 15 : 20; // morning slightly busier

    const score = Math.min(100, Math.round(capScore + queueScore + crowdScore + hourScore));

    const reasons: string[] = [];
    if (capacityRatio > 0.5) reasons.push('✓ Sufficient slot capacity available');
    if (expectedWaitMinutes <= 20) reasons.push('✓ Lower expected waiting time');
    if (crowdLevel === 'LOW') reasons.push('✓ Better processing availability');
    if (activeCounters >= 4) reasons.push('✓ Optimal active counter throughput');

    recommendations.push({
      slotId: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      score,
      expectedWaitMinutes,
      crowdLevel,
      capacityAvailable,
      reasons,
    });
  }

  // Sort by score descending
  return recommendations.sort((a, b) => b.score - a.score);
}
