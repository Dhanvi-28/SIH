import { Request, Response } from 'express';
import { getRecommendedSlots } from '../services/slotAllocator';

export async function getSlotRecommendations(req: Request, res: Response) {
  try {
    const { centerId, produceId, date, quantity } = req.query;

    if (!centerId || !produceId || !date || !quantity) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'centerId, produceId, date, and quantity are required' },
      });
    }

    const qty = parseFloat(quantity as string);
    const recommendations = await getRecommendedSlots(
      centerId as string,
      produceId as string,
      date as string,
      qty
    );

    return res.json({
      success: true,
      data: recommendations,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}
