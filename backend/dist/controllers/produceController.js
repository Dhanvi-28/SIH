"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProduces = getProduces;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function getProduces(req, res) {
    try {
        const produces = await prisma.produce.findMany({
            where: { active: true },
        });
        return res.json({
            success: true,
            data: produces,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
}
