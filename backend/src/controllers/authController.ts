import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthRequest } from '../middleware/auth';
import { Role } from '../types/enums';

const prisma = new PrismaClient();

export async function login(req: Request, res: Response) {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Identifier and password are required' },
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
      include: { farmer: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' },
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' },
      });
    }

    const payload = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      farmerId: user.farmer?.id,
    };

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });

    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          farmer: user.farmer,
        },
      },
      message: 'Login successful',
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { name, email, phone, password, role, village, district, state } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Name, phone, and password are required' },
      });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ phone }, { email: email || '' }] },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: { code: 'USER_EXISTS', message: 'User with this phone or email already exists' },
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRole = role === 'OFFICIAL' ? Role.OFFICIAL : role === 'ADMIN' ? Role.ADMIN : Role.FARMER;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: userRole,
        farmer: userRole === Role.FARMER ? {
          create: {
            farmerCode: `FARM-${Math.floor(10000 + Math.random() * 90000)}`,
            village: village || 'Local Village',
            district: district || 'Mandya',
            state: state || 'Karnataka',
          },
        } : undefined,
      },
      include: { farmer: true },
    });

    const payload = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      farmerId: user.farmer?.id,
    };

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          farmer: user.farmer,
        },
      },
      message: 'Registration successful',
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { farmer: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          farmer: user.farmer,
        },
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}
