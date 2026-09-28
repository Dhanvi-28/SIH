"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendedSlots = getRecommendedSlots;
const client_1 = require("@prisma/client");
const mlService_1 = require("./mlService");
const prisma = new client_1.PrismaClient();
async function getRecommendedSlots(centerId, produceId, date, quantity) {
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
    const recommendations = [];
    for (const slot of schedule.slots) {
        // Check remaining capacity in slot
        const capacityAvailable = slot.bookedQuantity + quantity <= slot.capacity;
        // Call ML Prediction engine for slot context
        const hour = parseInt(slot.startTime.split(':')[0], 10) || 10;
        const prediction = await (0, mlService_1.predictWaitingTime)({
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
        let crowdLevel = 'LOW';
        let crowdScore = 20;
        if (slot.bookedCount >= 6) {
            crowdLevel = 'HIGH';
            crowdScore = 5;
        }
        else if (slot.bookedCount >= 3) {
            crowdLevel = 'MEDIUM';
            crowdScore = 12;
        }
        // historical efficiency score (max 20)
        const hourScore = (hour >= 9 && hour <= 11) ? 15 : 20; // morning slightly busier
        const score = Math.min(100, Math.round(capScore + queueScore + crowdScore + hourScore));
        const reasons = [];
        if (capacityRatio > 0.5)
            reasons.push('✓ Sufficient slot capacity available');
        if (expectedWaitMinutes <= 20)
            reasons.push('✓ Lower expected waiting time');
        if (crowdLevel === 'LOW')
            reasons.push('✓ Better processing availability');
        if (activeCounters >= 4)
            reasons.push('✓ Optimal active counter throughput');
        if (!capacityAvailable)
            reasons.push('✗ Not enough capacity left for the requested quantity');
        recommendations.push({
            slotId: slot.id,
            scheduleId: schedule.id,
            date: schedule.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            score,
            expectedWaitMinutes,
            crowdLevel,
            capacityAvailable,
            remainingCapacity: Math.max(0, slot.capacity - slot.bookedQuantity),
            reasons,
        });
    }
    // Bookable slots first, then by score descending
    return recommendations.sort((a, b) => {
        if (a.capacityAvailable !== b.capacityAvailable)
            return a.capacityAvailable ? -1 : 1;
        return b.score - a.score;
    });
}
