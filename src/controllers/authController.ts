import { Request, Response, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient.js';
import cloudinary from '../config/cloudinary.js';

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
 *       400:
 *         description: Registration failed
 */
export const register: RequestHandler = async (req, res): Promise<void> => {
    try {
        const { username, password, displayName } = req.body;
        const fileBuffer = req.file?.buffer;

        const hashedPassword = bcrypt.hashSync(password, 8);

        let avatarUrl: string | null = null;
        if (fileBuffer) {
            const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: 'image', folder: 'avatars' },
                    (error, result) => {
                        if (error) return reject(error);
                        return resolve(result as { secure_url: string });
                    }
                );
                stream.end(fileBuffer);
            });
            avatarUrl = result.secure_url;
        }

        const user = await prisma.user.create({
            data: {
                username,
                email: `${username}@whispery.app`,
                password: hashedPassword,
                displayName: displayName ?? null,
                avatar: avatarUrl
            }
        });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '24h' });
        res.status(200).json({ token });
    } catch (err) {
        const error = err as Error;
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
 *       400:
 *         description: Login failed
 */
export const login: RequestHandler = async (req, res): Promise<void> => {
    try {
        const { username, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user || !user.password) {
            res.status(400).json({ message: 'Invalid username or password' });
            return;
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            res.status(400).json({ message: 'Invalid username or password' });
            return;
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '24h' });
        res.status(200).json({ token, user });
    } catch (err) {
        const error = err as Error;
        res.status(400).json({ message: error.message });
    }
};
