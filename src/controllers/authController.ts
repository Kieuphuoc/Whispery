import { Request, Response, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import admin from 'firebase-admin';
import prisma from '../prismaClient.js';
import { uploadToAzure } from '../configs/azureStorage.js';

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
export const register: RequestHandler = async (req, res): Promise<void> => {
    try {
        const { username, password, displayName } = req.body;
        console.log(`[Auth/Register] Attempt to register username: ${username}`);
        const file = req.file;

        const hashedPassword = bcrypt.hashSync(password, 8);

        let avatarUrl: string | null = null;
        if (file && file.buffer) {
            avatarUrl = await uploadToAzure(
                file.buffer,
                file.originalname,
                file.mimetype,
                'avatars'
            );
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

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '24h' });
        console.log(`[Auth/Register] Successfully registered & logged in username: ${user.username} (ID: ${user.id})`);
        res.status(200).json({ token, user });
    } catch (err) {
        const error = err as Error;
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
export const login: RequestHandler = async (req, res): Promise<void> => {
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

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '24h' });
        console.log(`[Auth/Login] Successfully logged in username: ${user.username} (ID: ${user.id})`);
        res.status(200).json({ token, user: userWithoutPassword });
    } catch (err) {
        const error = err as Error;
        console.error(`[Auth/Login] Error:`, error.message);
        res.status(400).json({ message: error.message });
    }
};

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Google Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
export const googleLogin: RequestHandler = async (req, res): Promise<void> => {
    try {
        const { idToken } = req.body;
        console.log(`[Auth/Google] Attempt to login with Google token`);

        if (!idToken) {
            res.status(400).json({ message: 'ID Token is required' });
            return;
        }

        // Verify the token with Firebase Admin
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, email, name, picture } = decodedToken;

        if (!email) {
            res.status(400).json({ message: 'Email not found in Google account' });
            return;
        }

        // Find user by googleId or email
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { googleId: uid },
                    { email: email }
                ]
            }
        });

        if (!user) {
            // Create new user if not exists
            // Generate a unique username from email
            const baseUsername = email.split('@')[0];
            let uniqueUsername = baseUsername;
            let counter = 1;

            while (await prisma.user.findUnique({ where: { username: uniqueUsername } })) {
                uniqueUsername = `${baseUsername}${counter}`;
                counter++;
            }

            user = await prisma.user.create({
                data: {
                    username: uniqueUsername,
                    email: email,
                    googleId: uid,
                    displayName: name || null,
                    avatar: picture || null,
                }
            });
            console.log(`[Auth/Google] Created new user: ${user.username} (ID: ${user.id})`);
        } else if (!user.googleId) {
            // Link google account to existing email account
            user = await prisma.user.update({
                where: { id: user.id },
                data: { googleId: uid }
            });
            console.log(`[Auth/Google] Linked Google account to existing user: ${user.username}`);
        }

        const { password: _, ...userWithoutPassword } = user;
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '24h' });

        console.log(`[Auth/Google] Successfully logged in: ${user.username}`);
        res.status(200).json({ token, user: userWithoutPassword });

    } catch (err) {
        const error = err as Error;
        console.error(`[Auth/Google] Error:`, error.message);
        res.status(400).json({ message: 'Invalid Google token or verification failed' });
    }
};
