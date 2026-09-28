"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: process.env.PORT || 5000,
    jwtSecret: process.env.JWT_SECRET || 'optifreight_secret_key_2026',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:8000',
};
