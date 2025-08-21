import express from 'express'
import prisma from '../prismaClient.js'
import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary.js'
import { Visibility } from '@prisma/client';

const router = express.Router()

// POST a comments
router.post('/', async (req, res) => {
    try {
        const { content, voicePinId } = req.body
        const createComment = await prisma.comment.create({
            data: {
                content,
                userId: req.userId,
                voicePinId,
            }
        })
       res.status(201).json({ createComment });
    } catch (err) {
        console.log(err.message)
        res.sendStatus(503)
    }

})

// DELETE a comment
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.userId

        await prisma.comment.deleteMany({ // When Delete using two key = deleteMany
            where: {
                id: parseInt(id),
                userId: userId
            }
        })
        res.sendStatus(204)

    } catch (err) {
        console.log(err.message)
        res.sendStatus(503)
    }
})

// UPDATE a comment
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { content, voicePinId } = req.body
        const updatedComment = await prisma.comment.update({
            where: {
                id: parseInt(id),
                userId: req.userId
            },
            data: {
                content,
                userId: req.userId,
                voicePinId,
            }
        })
        res.status(200).json({ updatedComment }); // ✅ gửi response đúng cách

    } catch (err) {
        console.log(err.message)
        res.sendStatus(503)
    }
})

export default router