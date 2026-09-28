-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'FARMER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Farmer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "farmerCode" TEXT NOT NULL,
    "village" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Farmer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProcurementCenter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "village" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "dailyCapacity" REAL NOT NULL DEFAULT 1000.0,
    "activeCounters" INTEGER NOT NULL DEFAULT 4,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Produce" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'Tons',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "baseRatePerUnit" REAL NOT NULL DEFAULT 2300.0
);

-- CreateTable
CREATE TABLE "CenterProduce" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "centerId" TEXT NOT NULL,
    "produceId" TEXT NOT NULL,
    "maxDailyQuantity" REAL NOT NULL DEFAULT 500.0,
    CONSTRAINT "CenterProduce_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "ProcurementCenter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CenterProduce_produceId_fkey" FOREIGN KEY ("produceId") REFERENCES "Produce" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProcurementSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "centerId" TEXT NOT NULL,
    "produceId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "capacity" REAL NOT NULL DEFAULT 500.0,
    "bookedQuantity" REAL NOT NULL DEFAULT 0.0,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    CONSTRAINT "ProcurementSchedule_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "ProcurementCenter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProcurementSchedule_produceId_fkey" FOREIGN KEY ("produceId") REFERENCES "Produce" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Slot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scheduleId" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "capacity" REAL NOT NULL DEFAULT 50.0,
    "bookedCount" INTEGER NOT NULL DEFAULT 0,
    "bookedQuantity" REAL NOT NULL DEFAULT 0.0,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    CONSTRAINT "Slot_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "ProcurementSchedule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "farmerId" TEXT NOT NULL,
    "centerId" TEXT NOT NULL,
    "produceId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "tokenNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'BOOKED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "ProcurementCenter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_produceId_fkey" FOREIGN KEY ("produceId") REFERENCES "Produce" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "ProcurementSchedule" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "Slot" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QueueEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'ARRIVED',
    "estimatedWaitMinutes" INTEGER NOT NULL DEFAULT 30,
    "arrivedAt" DATETIME,
    "calledAt" DATETIME,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    CONSTRAINT "QueueEntry_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Procurement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "actualQuantity" REAL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "rejectionReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Procurement_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Inspection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "procurementId" TEXT NOT NULL,
    "moisture" REAL NOT NULL,
    "qualityGrade" TEXT NOT NULL,
    "foreignMaterial" REAL NOT NULL,
    "visibleDamage" REAL NOT NULL,
    "remarks" TEXT,
    "result" TEXT NOT NULL,
    "inspectedBy" TEXT NOT NULL,
    "inspectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Inspection_procurementId_fkey" FOREIGN KEY ("procurementId") REFERENCES "Procurement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Weighing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "procurementId" TEXT NOT NULL,
    "declaredQuantity" REAL NOT NULL,
    "actualQuantity" REAL NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'Tons',
    "remarks" TEXT,
    "recordedBy" TEXT NOT NULL,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Weighing_procurementId_fkey" FOREIGN KEY ("procurementId") REFERENCES "Procurement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "procurementId" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "rate" REAL NOT NULL,
    "grossAmount" REAL NOT NULL,
    "deductions" REAL NOT NULL DEFAULT 0.0,
    "netAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reference" TEXT NOT NULL,
    "processedAt" DATETIME,
    CONSTRAINT "Payment_procurementId_fkey" FOREIGN KEY ("procurementId") REFERENCES "Procurement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Prediction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "centerId" TEXT NOT NULL,
    "bookingId" TEXT,
    "predictedMinutes" INTEGER NOT NULL,
    "minMinutes" INTEGER NOT NULL,
    "maxMinutes" INTEGER NOT NULL,
    "confidence" REAL NOT NULL,
    "factorsJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Prediction_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "ProcurementCenter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Prediction_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HistoricalProcessingRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "centerId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "hour" INTEGER NOT NULL,
    "farmersCount" INTEGER NOT NULL,
    "totalQuantity" REAL NOT NULL,
    "activeCounters" INTEGER NOT NULL,
    "averageProcessingMinutes" REAL NOT NULL,
    "averageWaitingMinutes" REAL NOT NULL,
    "completedCount" INTEGER NOT NULL,
    CONSTRAINT "HistoricalProcessingRecord_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "ProcurementCenter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Farmer_userId_key" ON "Farmer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Farmer_farmerCode_key" ON "Farmer"("farmerCode");

-- CreateIndex
CREATE UNIQUE INDEX "ProcurementCenter_code_key" ON "ProcurementCenter"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Produce_code_key" ON "Produce"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CenterProduce_centerId_produceId_key" ON "CenterProduce"("centerId", "produceId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_tokenNumber_key" ON "Booking"("tokenNumber");

-- CreateIndex
CREATE UNIQUE INDEX "QueueEntry_bookingId_key" ON "QueueEntry"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Procurement_bookingId_key" ON "Procurement"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Inspection_procurementId_key" ON "Inspection"("procurementId");

-- CreateIndex
CREATE UNIQUE INDEX "Weighing_procurementId_key" ON "Weighing"("procurementId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_procurementId_key" ON "Payment"("procurementId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_reference_key" ON "Payment"("reference");
