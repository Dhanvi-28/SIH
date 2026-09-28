import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const Role = {
  FARMER: 'FARMER',
  OFFICIAL: 'OFFICIAL',
  ADMIN: 'ADMIN',
};

export const ScheduleStatus = {
  OPEN: 'OPEN',
  FILLING_FAST: 'FILLING_FAST',
  FULL: 'FULL',
  CLOSED: 'CLOSED',
};

export const BookingStatus = {
  BOOKED: 'BOOKED',
  ARRIVED: 'ARRIVED',
  WAITING: 'WAITING',
  CALLED: 'CALLED',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  NO_SHOW: 'NO_SHOW',
  CANCELLED: 'CANCELLED',
};

export const ProcurementStatus = {
  PENDING: 'PENDING',
  ARRIVED: 'ARRIVED',
  INSPECTED: 'INSPECTED',
  WEIGHED: 'WEIGHED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  PAID: 'PAID',
};

export const PaymentStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  PAID: 'PAID',
  FAILED: 'FAILED',
};

async function main() {
  console.log('🌱 Starting OptiFreight Database Seeding...');

  // 1. Clean existing data
  await prisma.notification.deleteMany();
  await prisma.prediction.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.weighing.deleteMany();
  await prisma.inspection.deleteMany();
  await prisma.procurement.deleteMany();
  await prisma.queueEntry.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.procurementSchedule.deleteMany();
  await prisma.centerProduce.deleteMany();
  await prisma.produce.deleteMany();
  await prisma.historicalProcessingRecord.deleteMany();
  await prisma.procurementCenter.deleteMany();
  await prisma.farmer.deleteMany();
  await prisma.user.deleteMany();

  // 2. Passwords
  const farmerPassword = await bcrypt.hash('farmer123', 10);
  const officialPassword = await bcrypt.hash('official123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  // 3. Create Demo Users
  const farmerUser = await prisma.user.create({
    data: {
      name: 'Ramesh Kumar',
      email: 'ramesh.farmer@example.com',
      phone: '9876543210',
      passwordHash: farmerPassword,
      role: Role.FARMER,
      farmer: {
        create: {
          farmerCode: 'FARM-78901',
          village: 'Mandya Rural',
          district: 'Mandya',
          state: 'Karnataka',
          preferredLanguage: 'en',
        },
      },
    },
    include: { farmer: true },
  });

  const officialUser = await prisma.user.create({
    data: {
      name: 'Suresh Gowda (Procurement Officer)',
      email: 'official@procurement.gov',
      phone: '9876543211',
      passwordHash: officialPassword,
      role: Role.OFFICIAL,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      name: 'Dr. Anita Rao (State Administrator)',
      email: 'admin@procurement.gov',
      phone: '9876543212',
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });

  console.log('✅ Created Demo Users (Farmer, Official, Admin)');

  // 4. Create Seed Farmers for queue simulation
  const additionalFarmers = [];
  const farmerNames = ['Basavaraj S', 'Chennappa M', 'Devraj K', 'Eshwarappa N', 'Girish P', 'Hanumanth V', 'Jagadish B', 'Kiran M', 'Lokesh T', 'Manjunath R'];
  for (let i = 0; i < farmerNames.length; i++) {
    const fUser = await prisma.user.create({
      data: {
        name: farmerNames[i],
        email: `farmer${i + 2}@example.com`,
        phone: `987650000${i}`,
        passwordHash: farmerPassword,
        role: Role.FARMER,
        farmer: {
          create: {
            farmerCode: `FARM-1000${i + 2}`,
            village: 'Mandya East',
            district: 'Mandya',
            state: 'Karnataka',
          },
        },
      },
      include: { farmer: true },
    });
    additionalFarmers.push(fUser.farmer!);
  }

  // 5. Create Procurement Centers
  const centerMandya = await prisma.procurementCenter.create({
    data: {
      code: 'KPC-001',
      name: 'Mandya Central Procurement Center',
      address: 'APMC Market Yard, Sugar Town Road',
      village: 'Mandya Town',
      district: 'Mandya',
      state: 'Karnataka',
      latitude: 12.5225,
      longitude: 76.8976,
      dailyCapacity: 1000.0,
      activeCounters: 4,
      status: 'OPEN',
    },
  });

  const centerMysuru = await prisma.procurementCenter.create({
    data: {
      code: 'KPC-002',
      name: 'Mysuru Agricultural Procurement Center',
      address: 'Bandipalya APMC Yard, Nanjangud Road',
      village: 'Mysuru South',
      district: 'Mysuru',
      state: 'Karnataka',
      latitude: 12.2958,
      longitude: 76.6394,
      dailyCapacity: 1200.0,
      activeCounters: 5,
      status: 'OPEN',
    },
  });

  const centerHassan = await prisma.procurementCenter.create({
    data: {
      code: 'KPC-003',
      name: 'Hassan Farmers Procurement Hub',
      address: 'BM Road, Near Industrial Area',
      village: 'Hassan Central',
      district: 'Hassan',
      state: 'Karnataka',
      latitude: 13.0072,
      longitude: 76.1018,
      dailyCapacity: 800.0,
      activeCounters: 3,
      status: 'OPEN',
    },
  });

  const centerTumakuru = await prisma.procurementCenter.create({
    data: {
      code: 'KPC-004',
      name: 'Tumakuru Grain Procurement Center',
      address: 'BH Road, APMC Complex',
      village: 'Tumakuru East',
      district: 'Tumakuru',
      state: 'Karnataka',
      latitude: 13.3409,
      longitude: 77.1006,
      dailyCapacity: 900.0,
      activeCounters: 4,
      status: 'OPEN',
    },
  });

  const centerBengaluru = await prisma.procurementCenter.create({
    data: {
      code: 'KPC-005',
      name: 'Bengaluru Rural Procurement Hub',
      address: 'Doddaballapura APMC Market',
      village: 'Doddaballapura',
      district: 'Bengaluru Rural',
      state: 'Karnataka',
      latitude: 13.1986,
      longitude: 77.7066,
      dailyCapacity: 1500.0,
      activeCounters: 6,
      status: 'OPEN',
    },
  });

  console.log('✅ Created 5 Procurement Centers');

  // 6. Create Produces (Crops)
  const produceRice = await prisma.produce.create({
    data: { name: 'Rice', code: 'CROP-RICE', unit: 'Tons', baseRatePerUnit: 2300.0 },
  });
  const produceWheat = await prisma.produce.create({
    data: { name: 'Wheat', code: 'CROP-WHEAT', unit: 'Tons', baseRatePerUnit: 2275.0 },
  });
  const produceMaize = await prisma.produce.create({
    data: { name: 'Maize', code: 'CROP-MAIZE', unit: 'Tons', baseRatePerUnit: 2090.0 },
  });
  const produceCotton = await prisma.produce.create({
    data: { name: 'Cotton', code: 'CROP-COTTON', unit: 'Tons', baseRatePerUnit: 6620.0 },
  });
  const produceGroundnut = await prisma.produce.create({
    data: { name: 'Groundnut', code: 'CROP-GROUNDNUT', unit: 'Tons', baseRatePerUnit: 6375.0 },
  });
  const produceSugarcane = await prisma.produce.create({
    data: { name: 'Sugarcane', code: 'CROP-SUGARCANE', unit: 'Tons', baseRatePerUnit: 3150.0 },
  });

  console.log('✅ Created 6 Produce Types');

  // 7. Associate Produces with Centers
  const centers = [centerMandya, centerMysuru, centerHassan, centerTumakuru, centerBengaluru];
  const produces = [produceRice, produceWheat, produceMaize, produceCotton, produceGroundnut, produceSugarcane];

  for (const center of centers) {
    for (const produce of produces) {
      await prisma.centerProduce.create({
        data: {
          centerId: center.id,
          produceId: produce.id,
          maxDailyQuantity: 500.0,
        },
      });
    }
  }

  // 8. Create Schedules and Slots for Today
  const todayStr = new Date().toISOString().split('T')[0];
  const timeSlots = [
    { start: '09:00', end: '09:30' },
    { start: '09:30', end: '10:00' },
    { start: '10:00', end: '10:30' },
    { start: '10:30', end: '11:00' },
    { start: '11:00', end: '11:30' },
    { start: '11:30', end: '12:00' },
    { start: '13:00', end: '13:30' },
    { start: '13:30', end: '14:00' },
    { start: '14:00', end: '14:30' },
    { start: '14:30', end: '15:00' },
    { start: '15:00', end: '15:30' },
    { start: '15:30', end: '16:00' },
  ];

  let todayMandyaScheduleId = '';
  let targetSlotId = '';

  for (const center of centers) {
    const schedule = await prisma.procurementSchedule.create({
      data: {
        centerId: center.id,
        produceId: produceRice.id,
        date: todayStr,
        startTime: '09:00',
        endTime: '17:00',
        capacity: 600.0,
        bookedQuantity: center.id === centerMandya.id ? 420.0 : 250.0,
        status: ScheduleStatus.OPEN,
      },
    });

    if (center.id === centerMandya.id) {
      todayMandyaScheduleId = schedule.id;
    }

    for (const ts of timeSlots) {
      const slot = await prisma.slot.create({
        data: {
          scheduleId: schedule.id,
          startTime: ts.start,
          endTime: ts.end,
          capacity: 50.0,
          bookedCount: center.id === centerMandya.id && ts.start === '11:30' ? 7 : 3,
          bookedQuantity: center.id === centerMandya.id && ts.start === '11:30' ? 45.0 : 20.0,
          status: 'AVAILABLE',
        },
      });

      if (center.id === centerMandya.id && ts.start === '11:30') {
        targetSlotId = slot.id;
      }
    }
  }

  console.log('✅ Created Schedules & Slots for Today');

  // 9. Create Active Queue & Bookings for Mandya Center
  const queueTokens = [
    { num: 'KPC-034', status: BookingStatus.COMPLETED, pos: 0, wait: 0, farmerIdx: 0, qty: 15.0 },
    { num: 'KPC-035', status: BookingStatus.PROCESSING, pos: 0, wait: 5, farmerIdx: 1, qty: 18.0 },
    { num: 'KPC-036', status: BookingStatus.CALLED, pos: 1, wait: 12, farmerIdx: 2, qty: 20.0 },
    { num: 'KPC-037', status: BookingStatus.ARRIVED, pos: 2, wait: 18, farmerIdx: 3, qty: 14.0 },
    { num: 'KPC-038', status: BookingStatus.ARRIVED, pos: 3, wait: 24, farmerIdx: 4, qty: 22.0 },
    { num: 'KPC-039', status: BookingStatus.ARRIVED, pos: 4, wait: 30, farmerIdx: 5, qty: 16.0 },
    { num: 'KPC-040', status: BookingStatus.ARRIVED, pos: 5, wait: 36, farmerIdx: 6, qty: 25.0 },
  ];

  for (const item of queueTokens) {
    const booking = await prisma.booking.create({
      data: {
        farmerId: additionalFarmers[item.farmerIdx].id,
        centerId: centerMandya.id,
        produceId: produceRice.id,
        scheduleId: todayMandyaScheduleId,
        slotId: targetSlotId,
        quantity: item.qty,
        tokenNumber: item.num,
        status: item.status,
      },
    });

    await prisma.queueEntry.create({
      data: {
        bookingId: booking.id,
        position: item.pos,
        status: item.status,
        estimatedWaitMinutes: item.wait,
        arrivedAt: new Date(Date.now() - 3600000 + item.pos * 300000),
      },
    });

    if (item.num === 'KPC-034') {
      const proc = await prisma.procurement.create({
        data: {
          bookingId: booking.id,
          actualQuantity: 14.8,
          status: ProcurementStatus.PAID,
          completedAt: new Date(),
        },
      });

      await prisma.inspection.create({
        data: {
          procurementId: proc.id,
          moisture: 11.8,
          qualityGrade: 'A',
          foreignMaterial: 0.8,
          visibleDamage: 0.2,
          remarks: 'Excellent paddy quality',
          result: 'ACCEPT',
          inspectedBy: officialUser.name,
        },
      });

      await prisma.weighing.create({
        data: {
          procurementId: proc.id,
          declaredQuantity: 15.0,
          actualQuantity: 14.8,
          recordedBy: officialUser.name,
        },
      });

      await prisma.payment.create({
        data: {
          procurementId: proc.id,
          quantity: 14.8,
          rate: 2300.0,
          grossAmount: 14.8 * 2300,
          deductions: 140.0,
          netAmount: 14.8 * 2300 - 140,
          status: PaymentStatus.PAID,
          reference: 'PAY-1001',
          processedAt: new Date(),
        },
      });
    }
  }

  // 10. Ramesh Kumar's Primary Demo Booking (KPC-041)
  const rameshBooking = await prisma.booking.create({
    data: {
      farmerId: farmerUser.farmer!.id,
      centerId: centerMandya.id,
      produceId: produceRice.id,
      scheduleId: todayMandyaScheduleId,
      slotId: targetSlotId,
      quantity: 24.0,
      tokenNumber: 'KPC-041',
      status: BookingStatus.ARRIVED,
    },
  });

  await prisma.queueEntry.create({
    data: {
      bookingId: rameshBooking.id,
      position: 6,
      status: BookingStatus.ARRIVED,
      estimatedWaitMinutes: 42,
      arrivedAt: new Date(),
    },
  });

  // Initial Notifications
  await prisma.notification.create({
    data: {
      userId: farmerUser.id,
      type: 'SLOT_REMINDER',
      title: 'Procurement Slot Today',
      message: 'Your slot at Mandya Central Procurement Center is scheduled for 11:30 AM today. Token: KPC-041.',
    },
  });

  await prisma.notification.create({
    data: {
      userId: farmerUser.id,
      type: 'QUEUE_UPDATE',
      title: 'Arrival Confirmed',
      message: 'Your arrival has been verified. Current Queue Position: #7 (6 farmers ahead). Estimated wait: 42 min.',
    },
  });

  // AI Prediction Record
  await prisma.prediction.create({
    data: {
      centerId: centerMandya.id,
      bookingId: rameshBooking.id,
      predictedMinutes: 42,
      minMinutes: 35,
      maxMinutes: 50,
      confidence: 0.84,
      factorsJson: JSON.stringify([
        { name: 'Farmers ahead (6)', impact: 'high' },
        { name: 'Active counters (4)', impact: 'medium' },
        { name: 'Avg processing speed (7.5 min)', impact: 'medium' },
        { name: 'Center queue load (High)', impact: 'high' },
        { name: 'Historical hourly trend', impact: 'medium' },
      ]),
    },
  });

  console.log('✅ Created Demo Queue & Ramesh Kumar Booking (KPC-041)');

  // 11. Seed Historical Records (120 records)
  const sampleHours = [8, 9, 10, 11, 12, 13, 14, 15, 16];
  for (let d = 1; d <= 14; d++) {
    const pastDate = new Date(Date.now() - d * 86400000).toISOString().split('T')[0];
    for (const h of sampleHours) {
      const farmersCount = Math.floor(Math.random() * 15) + 5;
      const activeCounters = Math.floor(Math.random() * 3) + 3;
      const totalQuantity = farmersCount * (Math.random() * 15 + 10);
      const avgProcMinutes = 6.0 + Math.random() * 3.0;
      const avgWaitMinutes = Math.round((farmersCount / activeCounters) * avgProcMinutes + Math.random() * 5);

      await prisma.historicalProcessingRecord.create({
        data: {
          centerId: centerMandya.id,
          date: pastDate,
          hour: h,
          farmersCount,
          totalQuantity: Math.round(totalQuantity * 10) / 10,
          activeCounters,
          averageProcessingMinutes: Math.round(avgProcMinutes * 10) / 10,
          averageWaitingMinutes: avgWaitMinutes,
          completedCount: farmersCount,
        },
      });
    }
  }

  console.log('✅ Seeded 120+ Historical Processing Records for AI ML model');
  console.log('🚀 OptiFreight Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error Seeding Database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
