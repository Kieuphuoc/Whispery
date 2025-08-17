import express from 'express'
import prisma from '../prismaClient.js'
import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary.js'
import { Visibility } from '@prisma/client';

const router = express.Router()

// Get all voice pint for logged-in user
router.get('/', async (req, res) => {
    const voicePin = await prisma.voicePin.findMany({
        where: {
            userId: req.userId
        }
    })
    res.json(voicePin)
})

// Create a new Voice Pin 
router.post('/', async (req, res) => {
    const { description, latitude, longitude, visibility, images } = req.body;

    try {
        // Upload audio lên Cloudinary từ memory buffer
        const streamUpload = (buffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'video',
                        folder: "voicepin"
                    }, // âm thanh, lưu vào thư mục voicepin ở cloudinary
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                streamifier.createReadStream(buffer).pipe(stream);
            });
        };

        const result = await streamUpload(req.file.buffer);
        const audioUrl = result.secure_url;

        // Tạo voice pin
        const voicePin = await prisma.voicePin.create({
            data: {
                audioUrl,
                description: description || '',
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                visibility: visibility || Visibility.PUBLIC,
                userId: req.userId,
                images: {
                    create: JSON.parse(images || '[]').map(url => ({ url }))
                }
            },
            include: {
                images: true
            }
        });

        res.json(voicePin);

    } catch (err) {
        console.log(err.message);
        res.sendStatus(503);
    }
});


// Update a Voice Pin
router.put('/:id', async (req, res) => {
})

// Delete a Voice Pin
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.voicePin.delete({
            where: {
                id: parseInt(id),
                userId: req.userId
            }
        })
        res.sendStatus(200)
    } catch (err) {
        console.log(err.message)
        res.sendStatus(503)
    }
})

// GET all comments of a voice pin /:id/comment
router.get('/', async (req, res) => {
    try {
        const comment = await prisma.comment.findMany({
            where: {
                userId: req.userId,
            }
        })
    } catch (err) {
        console.log(err.message)
        res.sendStatus(503)
    }
})

// POST a comments for a voice pin /:id/comment

// DELETE a comment of a voice pin /comment/commentId

// thêm xóa sửa reactions

export default router