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
        const createVoicePin = await prisma.voicePin.create({
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

        res.json({ createVoicePin });

    } catch (err) {
        console.log(err.message);
        res.sendStatus(503);
    }
});


// Update a Voice Pin
// Update a Voice Pin
router.put('/:id', upload.single('audio'), async (req, res) => {
    const { description, latitude, longitude, visibility, images } = req.body;
    const { id } = req.params;

    try {
        let audioUrl;

        // Nếu có file audio mới thì upload lên Cloudinary
        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: 'video', folder: 'voicepin' },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });

            audioUrl = result.secure_url;
        }

        await prisma.image.deleteMany({
            where: { voicePinId: parseInt(id) }
        });

        const updatedVoicePin = await prisma.voicePin.update({
            where: {
                id: parseInt(id),
                userId: req.userId
            },
            data: {
                ...(audioUrl && { audioUrl }), 
                description: description || '',
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                visibility: visibility || Visibility.PUBLIC,
                images: {
                    create: JSON.parse(images || '[]').map((url) => ({ url }))
                }
            },
            include: {
                images: true
            }
        });

        res.json({ updatedVoicePin });
    } catch (err) {
        console.log(err.message);
        res.sendStatus(503);
    }
});


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
        res.sendStatus(204)
    } catch (err) {
        console.log(err.message)
        res.sendStatus(503)
    }
})

// GET all comments of a voice pin /:id/comment
router.get('/:id/comment', async (req, res) => {
    try {
        const comments = await prisma.comment.findMany({
            where: {
                voicePinId: parseInt(req.params.id),
                userId: req.userId
            }
        });

        res.status(200).json({ comments });
    } catch (err) {
        console.log(err.message);
        res.sendStatus(503);
    }
});

// thêm xóa sửa reactions

export default router