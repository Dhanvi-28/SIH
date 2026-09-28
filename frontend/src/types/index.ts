export type Role = 'FARMER' | 'OFFICIAL' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  role: Role;
  farmer?: {
    id: string;
    farmerCode: string;
    village: string;
    district: string;
    state: string;
  };
}

export interface Produce {
  id: string;
  name: string;
  code: string;
  unit: string;
  baseRatePerUnit: number;
}

export interface CenterProduce {
  id: string;
  centerId: string;
  produceId: string;
  produce: Produce;
  maxDailyQuantity: number;
}

export interface ProcurementCenter {
  id: string;
  code: string;
  name: string;
  address: string;
  village: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  dailyCapacity: number;
  activeCounters: number;
  status: string;
  todayBookedQuantity?: number;
  remainingCapacity?: number;
  capacityUtilizationPercent?: number;
  currentQueue?: number;
  avgProcessingSpeedMinutes?: number;
  centerProduces?: CenterProduce[];
}

export interface Slot {
  id: string;
  scheduleId: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  bookedQuantity: number;
  status: string;
}

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

export interface Booking {
  id: string;
  farmerId: string;
  centerId: string;
  produceId: string;
  scheduleId: string;
  slotId: string;
  quantity: number;
  tokenNumber: string;
  status: 'BOOKED' | 'ARRIVED' | 'WAITING' | 'CALLED' | 'PROCESSING' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';
  createdAt: string;
  center: ProcurementCenter;
  produce: Produce;
  slot: Slot;
  schedule: {
    date: string;
    startTime: string;
    endTime: string;
  };
  farmer: {
    id: string;
    farmerCode: string;
    user: {
      name: string;
      phone: string;
    };
  };
  procurement?: Procurement;
}

export interface Inspection {
  id: string;
  procurementId: string;
  moisture: number;
  qualityGrade: string;
  foreignMaterial: number;
  visibleDamage: number;
  remarks: string | null;
  result: 'ACCEPT' | 'REJECT';
  inspectedBy: string;
  inspectedAt: string;
}

export interface Weighing {
  id: string;
  procurementId: string;
  declaredQuantity: number;
  actualQuantity: number;
  unit: string;
  remarks: string | null;
  recordedBy: string;
  recordedAt: string;
}

export interface Payment {
  id: string;
  procurementId: string;
  quantity: number;
  rate: number;
  grossAmount: number;
  deductions: number;
  netAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED';
  reference: string;
  processedAt: string | null;
}

export interface Procurement {
  id: string;
  bookingId: string;
  actualQuantity: number | null;
  status: 'PENDING' | 'ARRIVED' | 'INSPECTED' | 'WEIGHED' | 'ACCEPTED' | 'REJECTED' | 'PAYMENT_PENDING' | 'PAID';
  startedAt: string | null;
  completedAt: string | null;
  rejectionReason: string | null;
  inspection?: Inspection;
  weighing?: Weighing;
  payment?: Payment;
  booking?: Booking;
}

export interface QueueStatus {
  booking: Booking;
  nowServingToken: string;
  farmersAhead: number;
  queuePosition: number;
  estimatedWaitMinutes: number;
  minMinutes: number;
  maxMinutes: number;
  confidence: number;
  factors: Array<{ name: string; impact: 'high' | 'medium' | 'low' }>;
  activeCounters: number;
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
