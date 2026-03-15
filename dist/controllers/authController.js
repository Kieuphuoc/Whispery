import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient.js';
import { uploadToAzure } from '../config/azureStorage.js';
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               displayName:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     displayName:
 *                       type: string
 *                       nullable: true
 *                     avatar:
 *                       type: string
 *                       nullable: true
 *                     bio:
 *                       type: string
 *                       nullable: true
 *                     level:
 *                       type: integer
 *                     xp:
 *                       type: integer
 *                     scanRadius:
 *                       type: integer
 *                     status:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Registration failed
 */
export const register = async (req, res) => {
    try {
        const { username, password, displayName } = req.body;
        console.log(`[Auth/Register] Attempt to register username: ${username}`);
        const file = req.file;
        const hashedPassword = bcrypt.hashSync(password, 8);
        let avatarUrl = null;
        if (file && file.buffer) {
            avatarUrl = await uploadToAzure(file.buffer, file.originalname, file.mimetype, 'avatars');
        }
        const user = await prisma.user.create({
            data: {
                username,
                email: `${username}@whispery.app`,
                password: hashedPassword,
                displayName: displayName ?? null,
                avatar: avatarUrl
            },
            select: {
                id: true,
                username: true,
                email: true,
                displayName: true,
                avatar: true,
                bio: true,
                level: true,
                xp: true,
                scanRadius: true,
                status: true,
                createdAt: true,
                updatedAt: true
            }
        });
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        console.log(`[Auth/Register] Successfully registered & logged in username: ${user.username} (ID: ${user.id})`);
        res.status(200).json({ token, user });
    }
    catch (err) {
        const error = err;
        console.error(`[Auth/Register] Error:`, error.message);
        res.status(400).json({ message: error.message });
    }
};
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     displayName:
 *                       type: string
 *                       nullable: true
 *                     avatar:
 *                       type: string
 *                       nullable: true
 *                     bio:
 *                       type: string
 *                       nullable: true
 *                     level:
 *                       type: integer
 *                     xp:
 *                       type: integer
 *                     scanRadius:
 *                       type: integer
 *                     status:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     deletedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *       400:
 *         description: Login failed
 */
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log(`[Auth/Login] Attempt to login username: ${username}`);
        const user = await prisma.user.findUnique({
            where: { username }
        });
        if (!user || !user.password) {
            console.log(`[Auth/Login] Failed: Cannot find user or password not set for username: ${username}`);
            res.status(400).json({ message: 'Invalid username or password' });
            return;
        }
        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            console.log(`[Auth/Login] Failed: Invalid password for username: ${username}`);
            res.status(400).json({ message: 'Invalid username or password' });
            return;
        }
        // Return user data without password
        const { password: _, ...userWithoutPassword } = user;
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        console.log(`[Auth/Login] Successfully logged in username: ${user.username} (ID: ${user.id})`);
        res.status(200).json({ token, user: userWithoutPassword });
    }
    catch (err) {
        const error = err;
        console.error(`[Auth/Login] Error:`, error.message);
        res.status(400).json({ message: error.message });
    }
};
//# sourceMappingURL=authController.js.map