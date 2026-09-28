# SIH26032 — OptiFreight
# Smart Farmer Procurement Management System
## Complete Project Build Specification

> **Purpose:** This document is the implementation specification for the complete SIH26032 prototype. Give this file to Antigravity as the primary source of truth and instruct it to build the working application, not merely a UI mockup.

---

## 1. Official Problem Context

**Smart India Hackathon 2026**

- **Problem Statement ID:** SIH26032
- **Problem Statement:** Farmers often face long waiting times, lack of information regarding procurement schedules, and uncertainty about procurement status.
- **Theme:** Ministry of Consumer Affairs, Food & Public Distribution
- **Category:** Software
- **Team ID:** 146417
- **Team Name:** OptiFreight

The source presentation defines the solution as a **Smart Farmer Procurement Management System**: a digital platform connecting farmers with procurement centers for organized, transparent, and predictable procurement.

The core problems identified are:

1. Long waiting times
2. Uncertain procurement schedules
3. Overcrowded procurement centers
4. Limited visibility into queue position and procurement status

The core solution is one integrated platform connecting:

```text
Farmers
   ↓
Procurement Schedules
   ↓
Digital Booking / Token
   ↓
AI Waiting-Time Prediction
   ↓
Smart Slot Allocation
   ↓
Live Queue
   ↓
Inspection
   ↓
Weighing
   ↓
Accept / Reject
   ↓
Payment
   ↓
Procurement Status Tracking
```

---

# 2. Product Vision

## Vision

> **Make farmer procurement more predictable, organized, and transparent.**

The platform should replace uncertain physical waiting with:

- Pre-visit schedule visibility
- Capacity visibility
- Digital slot booking
- Digital tokens
- Live queue tracking
- AI-assisted waiting-time prediction
- Smart slot allocation
- End-to-end procurement tracking
- Transparent payment status
- Procurement-center operational dashboards

The system must benefit both sides:

### Farmer

The farmer should know:

- Where to go
- When to go
- Whether capacity is available
- Which slot is suitable
- What token they received
- How many farmers are ahead
- How long they may have to wait
- What stage their produce is currently in
- Whether the produce was accepted/rejected
- What happened to payment

### Procurement Center

The center should know:

- How many farmers are expected
- How much produce is expected
- How much capacity remains
- Current queue
- Active counters
- Processing workload
- Completed procurements
- Pending cases
- Overflows/bottlenecks

---

# 3. Core Solution Modules

Build the application around these five major modules from the proposed technical approach.

## Module 01 — BOOK

### Farmer Booking

Flow:

```text
Farmer Selection
      ↓
Select Procurement Center
      ↓
Select Date & Time
      ↓
Enter Produce Quantity
      ↓
Digital Token
```

The booking system must create a real database record and a unique digital token.

---

## Module 02 — AI PREDICT

### Waiting-Time Engine

The source concept identifies these real-time inputs:

- Queue size and capacity
- Produce volume in tons
- Average processing speed
- Active counter count
- Historical turnaround

The system uses these inputs to produce:

> **Estimated Waiting Time**

The presentation specifies a regression / Scikit-learn approach for the AI/ML model.

For the prototype, implement a practical ML/regression service that can operate with seeded historical data and gracefully handle limited historical data.

---

## Module 03 — ALLOCATE

### Smart Slot Allocation

The slot allocator must consider:

- Center daily capacity
- Predicted waiting time
- Expected arrivals
- Processing workload

The objective is:

> Assign optimal slots and balance farmer flow to prevent procurement-center bottlenecks.

The allocator should dynamically rank available slots.

---

## Module 04 — PROCURE

### Procurement Center Workflow

The source presentation specifies:

```text
TOKEN VERIFIED
      ↓
ARRIVAL
      ↓
INSPECTION
      ↓
WEIGHING
      ↓
DECISION
   ↙       ↘
ACCEPT     REJECT
      ↓
PAYMENT
```

Each stage must be represented in the application and persisted in the database.

---

## Module 05 — TRACK

### Status & Payment

The farmer must be able to see a vertical procurement timeline:

```text
ARRIVAL
   ↓
INSPECTION
   ↓
WEIGHING
   ↓
ACCEPTED / REJECTED
   ↓
PAYMENT
```

The status dashboard should expose:

- Live queue position
- Counter alert
- Inspection status
- Payment status
- Direct payment trigger/status

---

# 4. User Roles

Implement role-based access.

## 4.1 Farmer

A farmer can:

- Register/login
- View procurement centers
- View center schedules
- View available capacity
- Select produce
- Enter produce quantity
- Book a slot
- Receive a digital token
- View token
- View queue position
- View estimated waiting time
- Receive notifications
- Track procurement status
- View payment status
- View previous procurements

---

## 4.2 Procurement Center Official

An official can:

- Login
- View center dashboard
- View daily capacity
- View expected farmer flow
- View expected produce quantity
- View live queue
- Verify tokens
- Mark arrival
- Perform inspection
- Record weighing
- Accept/reject produce
- Record rejection reason
- Trigger payment
- View completed procurements
- View pending cases
- Monitor workload

---

## 4.3 Admin

Admin functionality should support the overall system.

Admin can:

- Manage procurement centers
- Manage officials
- View farmers
- Manage produce/crop types
- Manage procurement schedules
- Configure capacities
- Monitor center performance
- View system analytics

---

# 5. Farmer Application

The farmer experience is the most important user-facing part of the prototype.

It should be mobile-first, simple, accessible, and usable by farmers with limited digital literacy.

The source feasibility section specifically calls for:

- Simple UI
- Icon-driven navigation
- Multilingual support
- Lightweight application behavior
- SMS fallback for critical notifications
- Offline caching where practical

---

# 6. Farmer Dashboard

Create a dashboard containing:

## Header

- OptiFreight branding
- Farmer name
- Notification icon
- Profile
- Logout

## Today's/Upcoming Procurement

Display:

```text
Procurement Center
Date
Slot
Token
Produce
Quantity
Current status
```

## Queue Summary

Display:

```text
Queue Position
Farmers Ahead
Estimated Waiting Time
Active Counters
```

## Quick Actions

```text
Book Slot
Find Center
My Token
Track Procurement
History
Notifications
```

## Notification Preview

Show recent:

- Slot reminders
- Queue updates
- Schedule changes
- Procurement updates
- Payment updates

---

# 7. Procurement Center Discovery

Create a center discovery screen.

Each center should display:

- Name
- Location
- Distance if location is available
- Accepted produce
- Daily capacity
- Booked/expected capacity
- Remaining capacity
- Current queue
- Number of active counters
- Average processing speed
- Available slots
- Current operating status

Example:

```text
Mandya Procurement Center

Rice • Wheat • Maize

Today's Capacity
820 / 1000 tons

Current Queue
18 farmers

Active Counters
3

Average Processing
8 min

Available Slots
09:30 AM
10:30 AM
11:30 AM
01:30 PM
```

---

# 8. Procurement Schedule

Farmers must be able to view schedules before traveling.

Each schedule should include:

- Procurement center
- Produce
- Date
- Opening time
- Closing time
- Daily capacity
- Expected/booked quantity
- Remaining capacity
- Slot availability
- Status

Possible statuses:

```text
OPEN
FILLING_FAST
FULL
CLOSED
```

Capacity should be visually obvious.

---

# 9. Booking Flow

Implement a guided booking flow.

## Step 1 — Select Produce

Fields:

- Crop/produce
- Estimated quantity
- Unit
- Optional variety
- Harvest information if needed

Use produce examples such as:

- Rice
- Wheat
- Maize
- Cotton
- Groundnut
- Sugarcane

Do not hardcode the crop list into the frontend; retrieve it from the backend.

---

## Step 2 — Select Procurement Center

Show centers that:

- Accept the selected produce
- Have capacity
- Have open schedules

Allow sorting/filtering by:

- Distance
- Capacity
- Queue
- Availability

---

## Step 3 — Select Date

Show available procurement dates.

Disable unavailable/full dates.

---

## Step 4 — Smart Slot Recommendation

The system should recommend slots based on the Smart Slot Allocation engine.

For each recommended slot show:

```text
10:30 AM

Expected Wait: 18 minutes
Expected Crowd: Low
Capacity: Available

Why recommended:
✓ Lower expected queue
✓ Sufficient center capacity
✓ Better processing availability
```

Show multiple options where possible.

---

## Step 5 — Confirmation

Display:

```text
Farmer
Produce
Quantity
Center
Date
Slot
Estimated Wait
```

Then confirm the booking.

---

# 10. Digital Token

Every successful booking must generate a unique digital token.

Example:

```text
KPC-041
```

The token should contain:

- Token number
- Center
- Farmer
- Produce
- Quantity
- Date
- Slot
- Booking ID
- Queue status
- Estimated waiting time

Include a QR-style visual representation.

The QR may encode a booking/token identifier. A real scanner is optional for the prototype, but the token verification workflow must work through the official interface.

---

# 11. Live Queue

The live queue is a central differentiator.

Create a dedicated queue screen.

Display:

```text
YOUR TOKEN
KPC-041

NOW SERVING
KPC-034

FARMERS AHEAD
6

ESTIMATED WAIT
42 MIN

ACTIVE COUNTERS
3 / 4
```

Show the queue visually:

```text
NOW SERVING
KPC-034
     ↓
KPC-035
KPC-036
KPC-037
KPC-038
KPC-039
KPC-040
     ↓
YOUR TOKEN
KPC-041
```

The queue position must be calculated by the backend.

Do not allow the frontend to directly manipulate queue positions.

---

# 12. AI Waiting-Time Prediction

## Purpose

Predict how long a farmer is likely to wait before procurement processing begins.

The source presentation identifies these inputs:

```text
Queue Size & Farmers
Produce Quantity
Average Processing Speed
Active Counter Status
Historical Turnaround
```

The source technical approach specifies:

```text
AI / ML Model
Regression & Scikit-learn
```

Implement the model as a separate service/module.

---

## 12.1 Prediction Inputs

At minimum:

```text
farmersAhead
queueSize
totalQuantityAhead
farmerQuantity
averageProcessingMinutes
activeCounters
centerCapacity
expectedArrivals
historicalAverageTurnaround
currentHour
```

---

## 12.2 Prediction Output

Example:

```json
{
  "estimatedMinutes": 42,
  "minimumMinutes": 35,
  "maximumMinutes": 50,
  "confidence": 0.84
}
```

Also return interpretable factors:

```json
{
  "factors": [
    {
      "name": "Farmers ahead",
      "impact": "high"
    },
    {
      "name": "Active counters",
      "impact": "medium"
    },
    {
      "name": "Processing speed",
      "impact": "medium"
    },
    {
      "name": "Queue load",
      "impact": "high"
    }
  ]
}
```

---

# 13. AI Model Strategy

Implement a realistic prototype, not a fake AI label.

## Phase 1 — Cold Start

The source feasibility section recognizes that historical data may initially be limited.

Therefore:

- Seed historical records.
- Use a bootstrap regression model.
- Fall back to a transparent baseline calculation if insufficient data exists.

Baseline:

```text
base_wait =
    total_effective_workload_ahead
    / effective_processing_capacity
```

Then adjust using:

- Active counters
- Historical turnaround
- Current queue load
- Expected produce volume
- Time-of-day workload

---

## Phase 2 — Historical Learning

Use historical records to train a regression model.

Possible features:

```text
queue_size
farmers_ahead
produce_quantity
active_counters
average_processing_speed
hour_of_day
day_of_week
center_capacity
historical_turnaround
```

Target:

```text
actual_wait_minutes
```

Possible models:

- Linear Regression
- Random Forest Regressor
- Gradient Boosting Regressor

For the SIH prototype, choose a model that is reliable and easy to explain.

Do not claim production-level accuracy without measured validation.

---

# 14. AI Prediction UI

Do not show only a number.

Create an expandable explanation:

```text
AI-Assisted Waiting-Time Prediction

Estimated Wait
42 minutes

Likely Range
35–50 minutes

Confidence
84%

Factors

Farmers Ahead       High Impact
Active Counters     Medium Impact
Processing Speed    Medium Impact
Queue Load          High Impact
Historical Trend    Medium Impact
```

Use wording such as:

> AI-assisted estimate based on current queue and historical processing data.

Avoid claiming guaranteed waiting time.

---

# 15. Smart Slot Allocation

## Goal

Prevent workload spikes and bottlenecks.

The allocator should evaluate:

- Daily center capacity
- Expected arrivals
- Expected quantity
- Predicted waiting time
- Existing slot bookings
- Processing workload
- Active counters

---

## 15.1 Slot Score

Implement a transparent score such as:

```text
slotScore =
    capacityAvailabilityScore
  + queueScore
  + processingEfficiencyScore
  + expectedWorkloadScore
  + historicalEfficiencyScore
```

Normalize each factor to make the score understandable.

Then rank slots.

---

## 15.2 Slot API

Example:

```http
GET /api/slots/recommendations
```

Query parameters:

```text
centerId
date
produceId
quantity
```

Example response:

```json
[
  {
    "slotId": "slot-1030",
    "startTime": "10:30",
    "endTime": "11:00",
    "score": 91,
    "expectedWaitMinutes": 18,
    "crowdLevel": "LOW",
    "capacityAvailable": true
  },
  {
    "slotId": "slot-1130",
    "startTime": "11:30",
    "endTime": "12:00",
    "score": 78,
    "expectedWaitMinutes": 31,
    "crowdLevel": "MEDIUM",
    "capacityAvailable": true
  }
]
```

---

# 16. Procurement Center Dashboard

The dashboard should function as an operational command center.

## Summary Cards

```text
Today's Farmers
128

Expected Produce
820 Tons

Completed
81

Pending
34

Current Queue
18

Average Wait
31 min
```

---

## Capacity

Display:

```text
DAILY CAPACITY

820 / 1000 Tons

82% Utilized
```

Status:

```text
< 80%   Normal
80–95%  Filling Fast
> 95%   Almost Full
100%    Full
```

---

## Incoming Farmer Flow

Show:

- Upcoming slots
- Expected farmers
- Expected produce
- Slot occupancy
- Predicted workload

---

## Live Queue

Table:

```text
Token | Farmer | Produce | Quantity | Slot | Status | Action
```

Actions:

```text
Verify
Call
Start Inspection
Start Weighing
Accept
Reject
View
```

---

## Counters

Display:

```text
Counter 1
Serving KPC-034

Counter 2
Serving KPC-035

Counter 3
Idle

Counter 4
Maintenance
```

---

# 17. Token Verification

Official must be able to verify a farmer token.

Verification should display:

- Token
- Farmer
- Booking
- Center
- Slot
- Produce
- Quantity
- Booking validity
- Queue status

After verification:

```text
ARRIVAL
```

---

# 18. Arrival Workflow

When the farmer arrives:

```text
BOOKED
   ↓
ARRIVED
   ↓
WAITING
```

The system should record:

- Arrival timestamp
- Counter/queue assignment if applicable

Only valid arrived bookings should enter the active processing queue.

---

# 19. Inspection Workflow

Create an inspection form.

Suggested fields:

```text
Moisture %
Quality Grade
Foreign Material %
Visible Damage
Remarks
Inspection Result
```

Result:

```text
ACCEPT
REJECT
```

If rejected, require:

```text
Rejection Reason
```

Examples:

- Moisture above acceptable level
- Poor quality
- Damaged produce
- Quantity mismatch
- Foreign material
- Other

Do not invent crop-specific government quality thresholds unless configured as system data. For the prototype, make thresholds configurable.

---

# 20. Weighing Workflow

After inspection, allow the official to record weighing.

Fields:

```text
Declared Quantity
Actual Quantity
Unit
Weighing Time
Operator
Remarks
```

Example:

```text
Declared Quantity
24.0 Tons

Actual Quantity
23.6 Tons
```

Store the actual quantity as the quantity used for final procurement/payment calculations.

---

# 21. Decision Workflow

After inspection and weighing:

```text
ACCEPT
```

or

```text
REJECT
```

If accepted:

```text
WEIGHING
   ↓
ACCEPTED
   ↓
PAYMENT PROCESSING
   ↓
PAID
```

If rejected:

```text
INSPECTION
   ↓
REJECTED
   ↓
Reason Recorded
```

---

# 22. Payment

The presentation describes a direct payment trigger.

For the prototype, implement a simulated payment workflow rather than requiring a real banking integration.

Payment record:

```text
Procurement ID
Farmer
Accepted Quantity
Rate
Gross Amount
Deductions
Net Amount
Payment Status
Payment Reference
Timestamp
```

Example:

```text
Accepted Quantity: 23.6 Tons
Rate: ₹2,300 / Ton

Gross:
23.6 × 2300 = ₹54,280

Deductions:
₹280

Net:
₹54,000
```

Payment statuses:

```text
PENDING
PROCESSING
PAID
FAILED
```

A real bank/UPI integration can be a future extension.

---

# 23. Procurement Status Timeline

Farmer view:

```text
✓ Booking Confirmed
       ↓
✓ Arrival Verified
       ↓
✓ Inspection Completed
       ↓
✓ Weighing Completed
       ↓
● Accepted
       ↓
○ Payment Processing
       ↓
○ Payment Completed
```

Every stage should have:

- Status
- Timestamp
- Optional remarks
- Responsible official/system action

---

# 24. Notifications

Implement in-app notifications.

Critical notification categories:

## Slot Reminder

```text
Your procurement slot at Mandya Center is approaching.
```

## Queue Update

```text
Your token KPC-041 is now 3 positions away.
```

## Counter Alert

```text
Please proceed to Counter 2.
```

## Schedule Change

```text
Procurement timing has changed.
```

## Inspection Update

```text
Your produce inspection has been completed.
```

## Decision

```text
Your produce has been accepted.
```

or

```text
Your produce has been rejected.
```

## Payment

```text
Your payment is being processed.
```

or

```text
Payment completed successfully.
```

---

# 25. SMS / Push Notification Architecture

The source technical architecture specifies:

```text
Alerts:
SMS / Push Notifications
```

For the prototype:

- Implement in-app notifications.
- Create a notification service abstraction.
- Provide an SMS adapter interface.
- Provide a push notification adapter interface.
- Use mock/logging implementations locally.

Do not make paid external notification services mandatory.

The architecture should make it possible to connect a real SMS gateway later.

---

# 26. Low Connectivity Strategy

The feasibility section explicitly identifies poor internet connectivity as a challenge.

Implement the following where practical:

- Lightweight pages
- Minimal API payloads
- Cache frequently used farmer information
- Cache booking/token details
- Retry failed requests
- Offline-friendly shell
- SMS fallback abstraction for critical alerts

Do not build a complicated offline synchronization engine unless time permits.

Core booking operations should clearly communicate when the device is offline.

---

# 27. Multilingual / Accessibility Strategy

The feasibility section identifies limited digital literacy.

Implement:

- Simple labels
- Large touch targets
- Icons
- Clear status colors plus text
- Minimal steps
- Mobile-first layouts

Prepare the UI for:

```text
English
Kannada
Hindi
```

Full translation can be implemented through an i18n structure.

Do not display incorrect machine translations.

---

# 28. Admin Dashboard

Admin should see:

```text
Total Farmers
Active Procurement Centers
Today's Farmers
Today's Procurement Quantity
Pending Procurements
Pending Payments
Center Utilization
```

Analytics:

- Center-wise workload
- Produce-wise volume
- Daily farmer arrivals
- Average waiting time
- Acceptance/rejection rate
- Capacity utilization

---

# 29. Analytics

Build useful charts.

## Waiting Time

```text
Average waiting time by day
```

## Processing Time

```text
Average processing time by center
```

## Capacity

```text
Center capacity utilization
```

## Procurement

```text
Quantity procured over time
```

## Crop Distribution

```text
Rice
Wheat
Maize
Cotton
...
```

## Acceptance

```text
Accepted
Rejected
Pending
```

---

# 30. Database Model

Use a relational database.

Recommended:

- PostgreSQL or MySQL

The source presentation explicitly lists MySQL / PostgreSQL as database options.

Recommended implementation:

```text
PostgreSQL
+
Prisma ORM
```

---

## 30.1 User

```text
User
- id
- name
- email
- phone
- passwordHash
- role
- createdAt
- updatedAt
```

Roles:

```text
FARMER
OFFICIAL
ADMIN
```

---

## 30.2 Farmer

```text
Farmer
- id
- userId
- farmerCode
- village
- district
- state
- preferredLanguage
- createdAt
```

---

## 30.3 ProcurementCenter

```text
ProcurementCenter
- id
- code
- name
- address
- village
- district
- state
- latitude
- longitude
- dailyCapacity
- activeCounters
- status
- createdAt
- updatedAt
```

---

## 30.4 Produce

```text
Produce
- id
- name
- code
- unit
- active
```

---

## 30.5 CenterProduce

```text
CenterProduce
- id
- centerId
- produceId
- maxDailyQuantity
```

---

## 30.6 ProcurementSchedule

```text
ProcurementSchedule
- id
- centerId
- produceId
- date
- startTime
- endTime
- capacity
- bookedQuantity
- status
```

---

## 30.7 Slot

```text
Slot
- id
- scheduleId
- startTime
- endTime
- capacity
- bookedCount
- bookedQuantity
- status
```

---

## 30.8 Booking

```text
Booking
- id
- farmerId
- centerId
- produceId
- scheduleId
- slotId
- quantity
- tokenNumber
- status
- createdAt
- updatedAt
```

---

## 30.9 QueueEntry

```text
QueueEntry
- id
- bookingId
- position
- status
- estimatedWaitMinutes
- arrivedAt
- calledAt
- startedAt
- completedAt
```

---

## 30.10 Procurement

```text
Procurement
- id
- bookingId
- actualQuantity
- status
- startedAt
- completedAt
- rejectionReason
- createdAt
```

---

## 30.11 Inspection

```text
Inspection
- id
- procurementId
- moisture
- qualityGrade
- foreignMaterial
- visibleDamage
- remarks
- result
- inspectedBy
- inspectedAt
```

---

## 30.12 Weighing

```text
Weighing
- id
- procurementId
- declaredQuantity
- actualQuantity
- unit
- remarks
- recordedBy
- recordedAt
```

---

## 30.13 Payment

```text
Payment
- id
- procurementId
- quantity
- rate
- grossAmount
- deductions
- netAmount
- status
- reference
- processedAt
```

---

## 30.14 Notification

```text
Notification
- id
- userId
- type
- title
- message
- read
- createdAt
```

---

## 30.15 Prediction

```text
Prediction
- id
- centerId
- bookingId
- predictedMinutes
- minMinutes
- maxMinutes
- confidence
- factorsJson
- createdAt
```

---

## 30.16 HistoricalProcessingRecord

Required for the AI model.

```text
HistoricalProcessingRecord
- id
- centerId
- date
- hour
- farmersCount
- totalQuantity
- activeCounters
- averageProcessingMinutes
- averageWaitingMinutes
- completedCount
```

Seed this table with realistic historical data.

---

# 31. Backend Architecture

Use a modular backend.

Recommended:

```text
Node.js
TypeScript
Express
Prisma
PostgreSQL
```

The source presentation also allows Spring Boot. If Antigravity chooses Spring Boot, preserve the same API/domain structure.

---

# 32. AI/ML Service

Recommended:

```text
Python
FastAPI
Scikit-learn
```

Architecture:

```text
Frontend
   ↓
Backend API
   ↓
AI/ML Service
   ↓
Prediction
   ↓
Backend
   ↓
Frontend
```

The backend should own authorization and business rules.

The ML service should only perform prediction/model-related operations.

---

# 33. API Design

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

---

## Centers

```http
GET /api/centers
GET /api/centers/:id
GET /api/centers/:id/capacity
GET /api/centers/:id/schedules
GET /api/centers/:id/queue
```

---

## Produce

```http
GET /api/produce
```

---

## Schedules

```http
GET /api/schedules
GET /api/schedules/:id
```

---

## Slots

```http
GET /api/slots
GET /api/slots/:id
GET /api/slots/recommendations
```

---

## Booking

```http
POST /api/bookings
GET /api/bookings
GET /api/bookings/:id
POST /api/bookings/:id/cancel
```

---

## Queue

```http
GET /api/queue/:token
POST /api/queue/:token/arrive
POST /api/queue/:token/call
POST /api/queue/:token/start
POST /api/queue/:token/complete
POST /api/queue/:token/no-show
```

---

## Prediction

```http
POST /api/predictions/waiting-time
```

---

## Procurement

```http
GET /api/procurements
GET /api/procurements/:id
POST /api/procurements/:id/inspection
POST /api/procurements/:id/weigh
POST /api/procurements/:id/accept
POST /api/procurements/:id/reject
```

---

## Payments

```http
GET /api/payments
GET /api/payments/:id
POST /api/payments/:id/process
```

---

## Notifications

```http
GET /api/notifications
POST /api/notifications/:id/read
POST /api/notifications/read-all
```

---

## Analytics

```http
GET /api/analytics/center/:id
GET /api/analytics/admin
```

---

# 34. Standard API Response

Success:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "SLOT_FULL",
    "message": "This slot is no longer available."
  }
}
```

---

# 35. Authentication & Authorization

Implement secure authentication.

Requirements:

- Password hashing
- JWT/session authentication
- Protected routes
- Role-based access control
- Backend authorization
- Input validation
- Secure environment variables
- CORS configuration
- Rate limiting where appropriate

Never rely only on frontend route protection.

---

# 36. Recommended Frontend Stack

Use:

```text
React
TypeScript
Vite
Tailwind CSS
shadcn/ui or equivalent
React Router
TanStack Query
Recharts
Lucide Icons
```

The source presentation identifies React/HTML/CSS/JS as the frontend direction.

---

# 37. UI Design

The UI should communicate:

> Agriculture + Government + Technology + Trust

Use:

- Deep green
- Emerald
- Warm neutral backgrounds
- Blue for informational states
- Amber for warnings
- Red for rejection/errors

Avoid excessive gradients.

Prioritize readability.

---

# 38. Farmer Mobile UI

The farmer application must work especially well on mobile.

Use:

- Large buttons
- Large token number
- Large queue number
- Clear status labels
- Bottom navigation where appropriate
- Simple booking wizard
- Minimal typing

Recommended bottom navigation:

```text
Home
Book
Queue
Procurement
Profile
```

---

# 39. Official Desktop UI

Recommended sidebar:

```text
Dashboard
Live Queue
Bookings
Procurements
Capacity
Analytics
Notifications
Profile
```

---

# 40. Important Reusable Components

Create:

```text
AppShell
Sidebar
Topbar
StatCard
CenterCard
CapacityBar
QueueCard
TokenCard
StatusBadge
BookingStepper
SlotCard
PredictionCard
NotificationItem
ProcurementTimeline
ProcurementStatus
DataTable
ChartCard
ConfirmDialog
LoadingSkeleton
EmptyState
ErrorState
```

Avoid duplicated implementations.

---

# 41. Real-Time Queue Updates

Use either:

- WebSockets
- Server-Sent Events
- Polling

For a prototype, polling is acceptable.

Recommended:

```text
Queue: every 10 seconds
Notifications: every 15 seconds
Dashboard metrics: every 30 seconds
```

Whenever queue data changes:

1. Recalculate positions.
2. Recalculate estimated waiting time.
3. Update farmer dashboard.
4. Update official dashboard.
5. Generate relevant notifications.

---

# 42. Queue Logic

For the initial prototype, use FIFO ordering within a slot.

Queue order:

```text
Valid booking
    ↓
Scheduled slot
    ↓
Arrival confirmed
    ↓
Arrival timestamp
```

Statuses:

```text
BOOKED
ARRIVED
WAITING
CALLED
PROCESSING
COMPLETED
NO_SHOW
CANCELLED
```

Do not allow arbitrary queue-position editing.

---

# 43. Business Rules

## Booking

- Cannot book a closed schedule.
- Cannot book a full slot.
- Quantity must be positive.
- Booking must reserve capacity.
- Prevent duplicate bookings where business rules prohibit them.

## Arrival

- Valid booking required.
- Official can verify arrival.
- Arrival timestamp must be stored.

## Queue

- Only valid arrived bookings enter active queue.
- No-show removes booking from active queue.
- Called farmer moves to processing workflow.

## Inspection

- Inspection must occur before final accept/reject.

## Weighing

- Weighing must occur before procurement completion.

## Payment

- Payment processing only after acceptance.
- Amount derived from accepted quantity and configured rate.
- Payment status must be persisted.

---

# 44. Capacity Management

Capacity must exist at multiple levels:

```text
Center Daily Capacity
        ↓
Schedule Capacity
        ↓
Slot Capacity
```

Track both:

- Number of farmers
- Produce quantity

Do not assume that farmer count alone represents workload.

Example:

```text
10 farmers × 1 ton
```

is different from:

```text
10 farmers × 10 tons
```

The AI and allocation systems should account for produce volume.

---

# 45. Procurement Data Inputs

The source presentation identifies these procurement data points:

- Center schedule/timing
- Available capacity in tons/day
- Number of registered farmers
- Produce quantity in bags/crops
- Active operational counters
- Historical data from past cycles

Use these as first-class data points in the application.

---

# 46. Center Operational Dashboard

The core management loop should display:

```text
Daily Capacity Tracking
Incoming Farmer Flow
Live Queue Status
Completed Procurements
Pending Cases
Overflow/Bottleneck Risk
```

Add visual warnings when workload becomes high.

---

# 47. Bottleneck Detection

Create a simple risk indicator.

Inputs:

- Capacity utilization
- Queue length
- Predicted wait
- Expected arrivals
- Active counters
- Processing speed

Possible states:

```text
NORMAL
MODERATE LOAD
HIGH LOAD
BOTTLENECK RISK
FULL
```

This is an operational indicator, not an absolute guarantee.

---

# 48. Demo Mode

Create a clearly labeled demo/simulation control for SIH presentation.

Possible actions:

```text
Advance Queue
Call Next Farmer
Simulate Arrival
Complete Inspection
Complete Weighing
Accept Produce
Trigger Payment
```

These controls should only be available to an authorized demo/admin role.

The normal farmer workflow must not depend on demo controls.

---

# 49. Seed Data

Create realistic seed data.

## Centers

At least five sample centers.

Example names:

```text
KPC-001 — Mandya Central Procurement Center
KPC-002 — Mysuru Agricultural Procurement Center
KPC-003 — Hassan Farmers Procurement Hub
KPC-004 — Tumakuru Grain Procurement Center
KPC-005 — Bengaluru Rural Procurement Hub
```

These are prototype/demo names and should be clearly treated as seeded data.

---

## Crops

```text
Rice
Wheat
Maize
Cotton
Groundnut
Sugarcane
```

---

## Farmers

Seed at least 20–50 farmers.

---

## Schedules

Create schedules for:

- Today
- Tomorrow
- Next 7 days

---

## Slots

Create slots at 30–60 minute intervals.

---

## Queue

Seed active queues with realistic positions.

---

## Historical Data

Seed enough historical records for the regression model.

---

## Procurement Records

Include:

- Pending
- Inspection
- Weighing
- Accepted
- Rejected
- Payment processing
- Paid

---

# 50. Demo Accounts

Create seeded accounts.

## Farmer

```text
Mobile: 9876543210
Password: farmer123
```

## Official

```text
Email: official@procurement.gov
Password: official123
```

## Admin

```text
Email: admin@procurement.gov
Password: admin123
```

Passwords must be hashed in the database.

These are prototype credentials only.

---

# 51. Exact SIH Demo Story

The prototype must support this complete demonstration.

## Step 1 — Farmer Login

Login as a farmer.

Dashboard:

```text
Upcoming Procurement

Mandya Central Procurement Center
Today — 11:30 AM

Token: KPC-041
```

---

## Step 2 — Queue

Open the token.

Show:

```text
Queue Position: 7
Farmers Ahead: 6
Estimated Wait: 42 minutes
```

---

## Step 3 — AI Explanation

Open the AI prediction.

Show:

```text
Estimated Wait: 42 minutes
Range: 35–50 minutes

Factors:
Farmers Ahead
Active Counters
Processing Speed
Queue Load
Historical Turnaround
```

---

## Step 4 — Official Login

Login as official.

Dashboard:

```text
Today's Farmers: 128
Current Queue: 18
Completed: 81
Pending: 34
Capacity: 82%
Average Wait: 31 min
```

---

## Step 5 — Token Verification

Verify KPC-041.

Mark:

```text
ARRIVED
```

---

## Step 6 — Call Farmer

Official clicks:

```text
CALL NEXT
```

Farmer receives:

```text
Your token KPC-041 has been called.
Proceed to Counter 2.
```

---

## Step 7 — Inspection

Enter:

```text
Moisture
Quality Grade
Foreign Material
Remarks
```

Set:

```text
ACCEPTED
```

---

## Step 8 — Weighing

Example:

```text
Declared: 24.0 Tons
Actual: 23.6 Tons
```

---

## Step 9 — Procurement Status

Farmer sees:

```text
✓ Arrival
✓ Inspection
✓ Weighing
✓ Accepted
● Payment Processing
```

---

## Step 10 — Payment

Simulate payment.

```text
Payment Completed
₹54,000
Reference: PAY-1024
```

Farmer now sees:

```text
✓ Arrival
✓ Inspection
✓ Weighing
✓ Accepted
✓ Payment Completed
```

This complete journey must work without manually modifying the database.

---

# 52. Testing

At minimum test:

## Booking

- Available slot booking
- Full slot rejection
- Invalid quantity
- Duplicate/invalid booking

## Queue

- Correct queue ordering
- Correct position calculation
- No-show behavior
- Call-next behavior

## AI

- Prediction with valid data
- Prediction with limited historical data
- Prediction when counters change

## Allocation

- Slot ranking
- Capacity restrictions
- High-load behavior

## Procurement

- Inspection
- Weighing
- Accept
- Reject
- Rejection reason

## Payment

- Correct amount
- Payment status transition

## Security

- Farmer cannot access official APIs
- Official cannot modify unauthorized centers
- Admin can access management functions

---

# 53. Error Handling

Implement friendly error states.

Examples:

```text
This slot is no longer available.
Please choose another slot.
```

```text
The procurement center is currently at capacity.
```

```text
Unable to update queue.
Please try again.
```

Do not expose stack traces to users.

---

# 54. Loading States

Every API-driven page should include:

- Skeletons
- Spinners where appropriate
- Disabled submit buttons during requests
- Retry actions
- Empty states

Do not show blank screens during loading.

---

# 55. Responsive Requirements

## Mobile

Optimize for:

- Farmer dashboard
- Booking
- Token
- Queue
- Notifications
- Procurement timeline

## Desktop

Optimize for:

- Official dashboard
- Queue management
- Analytics
- Capacity
- Admin management

---

# 56. Architecture

The source presentation defines this overall architecture:

```text
FARMER APP
     ↓
BACKEND / API
     ↓
AI / ML ENGINE
     ↓
DATABASE
     ↓
NOTIFICATIONS
```

Implement the same logical separation.

Recommended detailed architecture:

```text
┌─────────────────────────────┐
│       Farmer Web/PWA        │
│      React + TypeScript     │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│       Backend API           │
│ Node.js / Express / TS      │
│ Auth + RBAC + Business      │
│ Rules + Queue + Booking     │
└───────┬───────────┬─────────┘
        │           │
        │           ▼
        │    ┌────────────────┐
        │    │ AI/ML Service  │
        │    │ Python         │
        │    │ Scikit-learn   │
        │    └────────────────┘
        │
        ▼
┌─────────────────────────────┐
│       PostgreSQL/MySQL      │
│ Users / Centers / Slots /   │
│ Queue / Procurement /       │
│ Historical Data / Payments  │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Notification Service        │
│ In-app + SMS/Push adapters  │
└─────────────────────────────┘
```

---

# 57. Technology Stack

The source presentation specifies:

### Frontend

```text
React / HTML / CSS / JavaScript
```

Recommended implementation:

```text
React + TypeScript + Vite + Tailwind
```

### Backend

Source options:

```text
Node.js / Spring Boot
```

Recommended:

```text
Node.js + TypeScript + Express
```

### AI/ML

```text
Python + Scikit-learn
```

### Database

```text
MySQL / PostgreSQL
```

Recommended:

```text
PostgreSQL
```

### Alerts

```text
SMS / Push Notifications
```

For local development, use mock adapters.

---

# 58. Project Structure

Recommended:

```text
optifreight/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── routes/
│   │   └── lib/
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── repositories/
│   │   ├── utils/
│   │   └── app.ts
│   └── ...
│
├── ml-service/
│   ├── app/
│   │   ├── model/
│   │   ├── routes/
│   │   ├── services/
│   │   └── main.py
│   ├── data/
│   └── requirements.txt
│
├── database/
│   ├── migrations/
│   └── seed/
│
├── docker-compose.yml
├── .env.example
├── README.md
└── package.json
```

Adapt the structure if Antigravity chooses a monorepo framework, but preserve the logical separation.

---

# 59. Environment Variables

Create:

```text
.env.example
```

Example:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/optifreight

JWT_SECRET=change-this-secret

BACKEND_PORT=5000

FRONTEND_URL=http://localhost:5173

ML_SERVICE_URL=http://localhost:8000
```

If SMS/push providers are connected later, keep their keys in environment variables.

Never commit secrets.

---

# 60. Local Development

The project must have clear setup instructions.

Expected flow:

```bash
git clone <repository>
cd optifreight

npm install

# start database
docker compose up -d

# migrate database
npm run db:migrate

# seed database
npm run db:seed

# start development servers
npm run dev
```

If frontend/backend/ML services are separate, document their commands clearly.

---

# 61. Docker

Provide Docker Compose for:

```text
PostgreSQL
Backend
ML service
```

Frontend may run locally or through Docker.

The application should not require paid cloud services for the SIH demo.

---

# 62. Security

Implement:

- Password hashing
- JWT/session authentication
- RBAC
- Server-side authorization
- Request validation
- SQL/ORM-safe queries
- CORS
- Rate limiting
- Environment-based secrets
- Audit-friendly timestamps

Protect farmer records and procurement logs.

The source feasibility section explicitly identifies data privacy/security as a challenge and proposes authentication plus role-based access/data policies.

---

# 63. Scalability Roadmap

The source proposal defines:

```text
1. PROCUREMENT CENTER
   Single pilot deployment and validation
            ↓
2. MULTIPLE CENTERS
   Regional cluster integration
            ↓
3. DISTRICT LEVEL
   District-wide load balancing
            ↓
4. STATE LEVEL
   Full state network rollout
```

The prototype architecture should therefore avoid assumptions that there will only ever be one center.

All major records should be center-aware.

---

# 64. Operational Challenges & System Responses

The source proposal identifies the following challenge/solution pairs.

## Limited Digital Literacy

### Challenge

Farmers may struggle with complex applications.

### Response

- Simple UI
- Multilingual structure
- Icon-driven navigation
- Large touch targets

---

## Poor Internet Connectivity

### Challenge

Unreliable network access in rural areas.

### Response

- Lightweight app
- Offline caching
- SMS fallback for critical notifications

---

## Limited Historical Data

### Challenge

Initial lack of past queue and arrival logs.

### Response

- Bootstrap model
- Seed historical data for prototype
- Continuous refinement as new records accumulate

---

## Sudden Farmer Surges

### Challenge

Unexpected peak volumes can cause bottlenecks.

### Response

- Dynamic queue
- Dynamic slot allocation
- Real-time throughput adjustment
- Capacity alerts

---

## Data Privacy & Security

### Challenge

Farmer records and procurement logs must be protected.

### Response

- Authentication
- Role-based access
- Backend authorization
- Data access policies

---

# 65. Impact Goals

The source presentation identifies these farmer benefits:

- Reduced waiting time
- Better transparency
- Reduced unnecessary travel
- Timely notifications

Center benefits:

- Better capacity management
- Efficient resource allocation
- Real-time monitoring
- Data-driven planning

Overall impact categories:

### Social

Less overcrowding and waiting.

### Economic

Reduced time and travel costs.

### Operational

Better utilization of procurement centers.

### Digital

Transparent and trackable procurement.

The product messaging should communicate these outcomes without inventing unsupported numerical impact claims.

---

# 66. UI Messaging

Use the core product message:

> **SMART PROCUREMENT = LESS WAITING + BETTER CAPACITY + MORE TRANSPARENCY**

Use the central impact statement:

> **Making farmer procurement more predictable, organized, and transparent.**

Use these consistently in landing/login/about/demo areas.

---

# 67. Landing Page

Create a simple product landing page.

Hero:

```text
Smart Farmer Procurement Management System

Make procurement more predictable,
organized, and transparent.
```

CTA:

```text
Book a Procurement Slot
```

Supporting features:

```text
Digital Tokens
AI Waiting-Time Prediction
Smart Slot Allocation
Live Queue Tracking
Procurement Tracking
Transparent Payment
```

Do not make the landing page more important than the actual application.

---

# 68. Research Context

The source presentation identifies these research areas:

## Agricultural Procurement

- Farmer-to-procurement-center workflow
- Procurement scheduling
- Capacity management
- Produce inspection
- Produce weighing

## Queue Management

- Digital token systems
- Slot-based appointment systems
- Live queue monitoring
- Waiting-time estimation

## Artificial Intelligence

- Waiting-time prediction
- Historical data analysis
- Real-time queue-based prediction
- Smart slot allocation

## Digital Agriculture

- Farmer-centric digital platforms
- Mobile-first interfaces
- Rural connectivity considerations

References listed in the source presentation include:

- Ministry of Agriculture & Farmers Welfare, Government of India
- Digital Agriculture Mission
- e-NAM — National Agriculture Market
- Research literature on queue management and waiting-time prediction
- Research literature on digital agriculture and smart procurement

Do not claim that the prototype is officially integrated with any of these systems unless such integration is actually implemented and verified.

---

# 69. Important Prototype Boundaries

The following are prototype implementations unless real integrations are added:

### Payment

Simulated payment status/trigger.

### SMS

Mock notification adapter.

### Push Notifications

In-app or mock push service.

### Maps

Optional/free map implementation; do not require a paid API.

### AI

Prototype regression/ML model with seeded and accumulated historical data.

### Procurement Center Data

Seeded demonstration data unless connected to a real government source.

---

# 70. Definition of Done

Antigravity must not stop at generating page designs.

The project is complete only when:

## Authentication

- [ ] Farmer login works
- [ ] Official login works
- [ ] Admin login works
- [ ] Protected routes work
- [ ] RBAC works

## Farmer

- [ ] Dashboard works
- [ ] Center discovery works
- [ ] Schedule browsing works
- [ ] Capacity visibility works
- [ ] Booking works
- [ ] Smart slot recommendation works
- [ ] Digital token works
- [ ] Live queue works
- [ ] AI waiting-time prediction works
- [ ] Notifications work
- [ ] Procurement tracking works
- [ ] Payment status works
- [ ] History works

## Official

- [ ] Dashboard works
- [ ] Capacity monitoring works
- [ ] Queue works
- [ ] Token verification works
- [ ] Arrival works
- [ ] Inspection works
- [ ] Weighing works
- [ ] Accept/reject works
- [ ] Payment trigger works
- [ ] Analytics work

## Admin

- [ ] Center management works
- [ ] Schedule management works
- [ ] Farmer viewing works
- [ ] Official management works
- [ ] System analytics work

## AI/ML

- [ ] Historical data exists
- [ ] Model can predict waiting time
- [ ] Cold-start fallback works
- [ ] Prediction factors are visible
- [ ] Prediction API works

## Technical

- [ ] Database works
- [ ] Seed data works
- [ ] API works
- [ ] Frontend builds
- [ ] Backend builds
- [ ] ML service runs
- [ ] No TypeScript/build errors
- [ ] No critical runtime errors
- [ ] Responsive UI works
- [ ] Loading states work
- [ ] Error states work
- [ ] README is complete
- [ ] Setup is reproducible

---

# 71. Final End-to-End Acceptance Test

Run this exact scenario before declaring the project complete:

```text
START APPLICATION
       ↓
LOGIN AS FARMER
       ↓
VIEW CENTER SCHEDULE
       ↓
VIEW AVAILABLE CAPACITY
       ↓
SELECT PRODUCE + QUANTITY
       ↓
VIEW SMART SLOT RECOMMENDATIONS
       ↓
SELECT SLOT
       ↓
CONFIRM BOOKING
       ↓
RECEIVE DIGITAL TOKEN
       ↓
VIEW LIVE QUEUE
       ↓
VIEW AI WAITING-TIME ESTIMATE
       ↓
LOGIN AS OFFICIAL
       ↓
VIEW FARMER IN EXPECTED QUEUE
       ↓
VERIFY TOKEN
       ↓
MARK ARRIVAL
       ↓
CALL FARMER
       ↓
FARMER RECEIVES NOTIFICATION
       ↓
INSPECTION
       ↓
WEIGHING
       ↓
ACCEPT / REJECT
       ↓
PAYMENT PROCESSING
       ↓
PAYMENT COMPLETED
       ↓
FARMER OPENS PROCUREMENT
       ↓
SEES COMPLETE TIMELINE
```

Every step must work through the UI.

---

# 72. Antigravity Build Instructions

## IMPORTANT

Treat this document as the complete product specification.

### Do:

1. Build the complete repository.
2. Build frontend.
3. Build backend.
4. Build database schema.
5. Build migrations.
6. Build seed scripts.
7. Build AI/ML service.
8. Build authentication.
9. Build RBAC.
10. Build booking.
11. Build smart slot allocation.
12. Build digital tokens.
13. Build live queue.
14. Build waiting-time prediction.
15. Build procurement workflow.
16. Build inspection.
17. Build weighing.
18. Build accept/reject.
19. Build payment simulation.
20. Build notifications.
21. Build dashboards.
22. Build analytics.
23. Build demo controls.
24. Add validation.
25. Add loading/error/empty states.
26. Add tests.
27. Run the full application.
28. Fix errors.
29. Verify the end-to-end acceptance test.
30. Document exact setup instructions.

### Do NOT:

- Build only static mockups.
- Leave core functionality as TODOs.
- Hardcode all dashboard data into frontend components.
- Fake AI by displaying a random number.
- Allow frontend-only queue manipulation.
- Require paid APIs for the basic demo.
- Claim real government/bank integration when it is not implemented.
- Claim production-level AI accuracy without validation.
- Ignore mobile usability.

---

# 73. Priority Order

If implementation time becomes constrained, implement in this order:

## P0 — Must Work

1. Authentication
2. Farmer dashboard
3. Center/schedule data
4. Booking
5. Digital token
6. Live queue
7. AI waiting-time prediction
8. Official dashboard
9. Inspection
10. Weighing
11. Accept/reject
12. Payment simulation
13. Procurement timeline

## P1 — Important

14. Smart slot allocation
15. Notifications
16. Capacity analytics
17. Admin dashboard
18. Historical AI data
19. Demo controls

## P2 — Enhancement

20. Multilingual UI
21. PWA
22. Offline caching
23. SMS adapter
24. Push adapter
25. Advanced maps
26. More sophisticated ML

Never sacrifice P0 functionality to build P2 features.

---

# 74. Final Product Statement

OptiFreight is a **Smart Farmer Procurement Management System** that combines:

```text
REAL-TIME PROCUREMENT DATA
          +
AI WAITING-TIME PREDICTION
          +
SMART SLOT ALLOCATION
          +
DIGITAL TOKEN & QUEUE
          +
CENTER WORKFLOW
          +
PROCUREMENT STATUS TRACKING
          +
PAYMENT VISIBILITY
```

into one unified system.

The result should transform the procurement experience from:

```text
Uncertain Schedule
       ↓
Travel to Center
       ↓
Long Physical Queue
       ↓
Uncertain Waiting
       ↓
Unclear Processing Status
       ↓
Unclear Payment Status
```

into:

```text
Check Schedule
       ↓
Check Capacity
       ↓
Get Smart Slot
       ↓
Receive Digital Token
       ↓
Track Queue
       ↓
Arrive at Appropriate Time
       ↓
Inspection
       ↓
Weighing
       ↓
Acceptance/Rejection
       ↓
Payment Tracking
```

## Core Principle

> **SMART PROCUREMENT = LESS WAITING + BETTER CAPACITY + MORE TRANSPARENCY**

## Core Impact

> **Making farmer procurement more predictable, organized, and transparent.**

---

# 75. Source Basis

This specification is derived from the team's six-page SIH2026 idea presentation for **SIH26032 — Smart Farmer Procurement Management System**, including its problem statement, unified solution, technical approach, feasibility/viability analysis, impact/benefits, and research/reference sections.

Where this implementation specification adds engineering detail (database fields, endpoint naming, component structure, validation rules, seed data, testing, and implementation priorities), those are implementation decisions intended to turn the presented concept into a working prototype; they should not be represented as claims made by the original SIH presentation.

