"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentStatus = exports.ProcurementStatus = exports.BookingStatus = exports.Role = void 0;
exports.Role = {
    FARMER: 'FARMER',
    OFFICIAL: 'OFFICIAL',
    ADMIN: 'ADMIN',
};
exports.BookingStatus = {
    BOOKED: 'BOOKED',
    ARRIVED: 'ARRIVED',
    WAITING: 'WAITING',
    CALLED: 'CALLED',
    PROCESSING: 'PROCESSING',
    COMPLETED: 'COMPLETED',
    NO_SHOW: 'NO_SHOW',
    CANCELLED: 'CANCELLED',
};
exports.ProcurementStatus = {
    PENDING: 'PENDING',
    ARRIVED: 'ARRIVED',
    INSPECTED: 'INSPECTED',
    WEIGHED: 'WEIGHED',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED',
    PAYMENT_PENDING: 'PAYMENT_PENDING',
    PAID: 'PAID',
};
exports.PaymentStatus = {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    PAID: 'PAID',
    FAILED: 'FAILED',
};
