import prisma from '../prismaClient.js';
import { UserStatus, UserRole } from '@prisma/client';
/**
 * Get all users with search and filters.
 */
export const getAllUsers = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
        const skip = (page - 1) * limit;
        const search = req.query.search;
        const status = req.query.status;
        const role = req.query.role;
        const where = { deletedAt: null };
        if (search) {
            where.OR = [
                { username: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { displayName: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status && Object.values(UserStatus).includes(status))
            where.status = status;
        if (role && Object.values(UserRole).includes(role))
            where.role = role;
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    username: true,
                    email: true,
                    displayName: true,
                    avatar: true,
                    status: true,
                    role: true,
                    reputationScore: true,
                    postingBanned: true,
                    createdAt: true,
                    _count: { select: { voicePins: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.user.count({ where })
        ]);
        res.status(200).json({ users, total, page, totalPages: Math.ceil(total / limit) });
    }
    catch (err) {
        const error = err;
        res.status(500).json({ message: error.message });
    }
};
/**
 * Update user role or status.
 */
export const updateUser = async (req, res) => {
    try {
        const userId = Number(req.params.id);
        const { role, status, reputationScore } = req.body;
        const updateData = {};
        if (role && Object.values(UserRole).includes(role))
            updateData.role = role;
        if (status && Object.values(UserStatus).includes(status))
            updateData.status = status;
        if (reputationScore !== undefined)
            updateData.reputationScore = Number(reputationScore);
        const updated = await prisma.user.update({
            where: { id: userId },
            data: updateData
        });
        res.status(200).json(updated);
    }
    catch (err) {
        const error = err;
        res.status(500).json({ message: error.message });
    }
};
//# sourceMappingURL=adminUserController.js.map