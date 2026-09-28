import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { ProcurementStatus, PaymentStatus } from '../types/enums';

const prisma = new PrismaClient();

export async function getProcurements(req: AuthRequest, res: Response) {
  try {
    const procurements = await prisma.procurement.findMany({
      include: {
        booking: {
          include: {
            farmer: { include: { user: true } },
            center: true,
            produce: true,
            slot: true,
          },
        },
        inspection: true,
        weighing: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: procurements });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

export async function getProcurementById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const procurement = await prisma.procurement.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            farmer: { include: { user: true } },
            center: true,
            produce: true,
            slot: true,
          },
        },
        inspection: true,
        weighing: true,
        payment: true,
      },
    });

    if (!procurement) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Procurement record not found' } });
    }

    return res.json({ success: true, data: procurement });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

export async function submitInspection(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { moisture, qualityGrade, foreignMaterial, visibleDamage, remarks, result, rejectionReason } = req.body;

    if (!result || moisture === undefined || !qualityGrade) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Result, moisture %, and quality grade are required' },
      });
    }

    const procurement = await prisma.procurement.findUnique({
      where: { id },
      include: { booking: { include: { farmer: true } } },
    });

    if (!procurement) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Procurement not found' } });
    }

    const inspection = await prisma.inspection.upsert({
      where: { procurementId: id },
      create: {
        procurementId: id,
        moisture: parseFloat(moisture),
        qualityGrade,
        foreignMaterial: parseFloat(foreignMaterial || 0),
        visibleDamage: parseFloat(visibleDamage || 0),
        remarks,
        result,
        inspectedBy: req.user?.email || 'Official Inspector',
      },
      update: {
        moisture: parseFloat(moisture),
        qualityGrade,
        foreignMaterial: parseFloat(foreignMaterial || 0),
        visibleDamage: parseFloat(visibleDamage || 0),
        remarks,
        result,
        inspectedBy: req.user?.email || 'Official Inspector',
      },
    });

    const isAccepted = result === 'ACCEPT';
    const newStatus = isAccepted ? ProcurementStatus.INSPECTED : ProcurementStatus.REJECTED;

    await prisma.procurement.update({
      where: { id },
      data: {
        status: newStatus,
        rejectionReason: isAccepted ? null : (rejectionReason || remarks || 'Quality thresholds not met'),
      },
    });

    await prisma.notification.create({
      data: {
        userId: procurement.booking.farmer.userId,
        type: 'DECISION',
        title: isAccepted ? 'Produce Inspection Passed!' : 'Produce Inspection Rejected',
        message: isAccepted
          ? `Your produce inspection (Grade ${qualityGrade}, Moisture ${moisture}%) was passed successfully. Proceeding to weighing.`
          : `Inspection rejected. Reason: ${rejectionReason || remarks || 'Quality thresholds not met'}.`,
      },
    });

    return res.json({
      success: true,
      data: inspection,
      message: isAccepted ? 'Inspection passed' : 'Inspection rejected',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

export async function recordWeighing(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { actualQuantity, remarks } = req.body;

    if (!actualQuantity || parseFloat(actualQuantity) <= 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Valid actual quantity is required' },
      });
    }

    const procurement = await prisma.procurement.findUnique({
      where: { id },
      include: {
        booking: {
          include: { farmer: true, produce: true },
        },
      },
    });

    if (!procurement) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Procurement not found' } });
    }

    const actQty = parseFloat(actualQuantity);

    const weighing = await prisma.weighing.upsert({
      where: { procurementId: id },
      create: {
        procurementId: id,
        declaredQuantity: procurement.booking.quantity,
        actualQuantity: actQty,
        remarks,
        recordedBy: req.user?.email || 'Weighbridge Operator',
      },
      update: {
        declaredQuantity: procurement.booking.quantity,
        actualQuantity: actQty,
        remarks,
        recordedBy: req.user?.email || 'Weighbridge Operator',
      },
    });

    await prisma.procurement.update({
      where: { id },
      data: {
        status: ProcurementStatus.WEIGHED,
        actualQuantity: actQty,
      },
    });

    const rate = procurement.booking.produce.baseRatePerUnit || 2300;
    const grossAmount = actQty * rate;
    const deductions = Math.round(actQty * 10);
    const netAmount = grossAmount - deductions;
    const refNum = `PAY-${Math.floor(1000 + Math.random() * 9000)}`;

    await prisma.payment.upsert({
      where: { procurementId: id },
      create: {
        procurementId: id,
        quantity: actQty,
        rate,
        grossAmount,
        deductions,
        netAmount,
        status: PaymentStatus.PENDING,
        reference: refNum,
      },
      update: {
        quantity: actQty,
        rate,
        grossAmount,
        deductions,
        netAmount,
      },
    });

    await prisma.notification.create({
      data: {
        userId: procurement.booking.farmer.userId,
        type: 'DECISION',
        title: 'Weighing Completed',
        message: `Weighing recorded: Actual Weight = ${actQty} Tons (Declared: ${procurement.booking.quantity} Tons). Payout estimated: ₹${netAmount.toLocaleString('en-IN')}.`,
      },
    });

    return res.json({
      success: true,
      data: weighing,
      message: 'Weighing recorded successfully',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

export async function acceptProcurement(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const procurement = await prisma.procurement.findUnique({
      where: { id },
      include: { booking: { include: { farmer: true } }, payment: true },
    });

    if (!procurement) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Procurement not found' } });
    }

    await prisma.procurement.update({
      where: { id },
      data: { status: ProcurementStatus.ACCEPTED, completedAt: new Date() },
    });

    await prisma.notification.create({
      data: {
        userId: procurement.booking.farmer.userId,
        type: 'DECISION',
        title: 'Produce Accepted!',
        message: 'Your produce has been accepted into central inventory. Payment payout is ready for processing.',
      },
    });

    return res.json({ success: true, message: 'Procurement accepted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

export async function rejectProcurement(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const procurement = await prisma.procurement.findUnique({
      where: { id },
      include: { booking: { include: { farmer: true } } },
    });

    if (!procurement) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Procurement not found' } });
    }

    await prisma.procurement.update({
      where: { id },
      data: {
        status: ProcurementStatus.REJECTED,
        rejectionReason: reason || 'Quality standards not satisfied',
        completedAt: new Date(),
      },
    });

    await prisma.notification.create({
      data: {
        userId: procurement.booking.farmer.userId,
        type: 'DECISION',
        title: 'Produce Rejected',
        message: `Procurement rejected. Reason: ${reason || 'Quality standards not satisfied'}.`,
      },
    });

    return res.json({ success: true, message: 'Procurement rejected' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}
