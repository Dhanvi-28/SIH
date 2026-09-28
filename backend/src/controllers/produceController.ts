import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getProduces(req: Request, res: Response) {
  try {
    const produces = await prisma.produce.findMany({
      where: { active: true },
    });
    return res.json({
      success: true,
      data: produces,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}
