import prisma from '../prismaClient.js'
import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary.js'
import { Visibility } from '@prisma/client';

export const createVoicePin = async (description, latitude, longitude, visibility, images, userId) => {
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

        const voicePin = await prisma.voicePin.create({
            data: {
                audioUrl,
                description: description || '',
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                visibility: visibility || Visibility.PUBLIC,
                userId: userId,
                images: {
                    create: JSON.parse(images || '[]').map(url => ({ url }))
                }
            },
            include: {
                images: true
            }
        });

        return { voicePin };

    } catch (err) {
        console.log(err.message);
        throw err
    }
}

export const getVoicePin = async (userId) => {
    try {
        const voicePin = await prisma.voicePin.findMany({
            where: {
                userId: userId
            }
        })

        return { voicePin }
    } catch (err) {
        console.log(err.message);
        throw err
    }
}

export const deleteVoicePin = async (voiceId, userId) => {
    try {
        const voicePin = await prisma.voicePin.delete({
            where: {
                id: parseInt(voiceId),
                userId: userId
            }
        })
        return { voicePin }
    } catch (err) {
        console.log(err.message);
        throw err
    }
}

export const getAllCommentOfVoicePin = async (voiceId, userId) => {
    try {
        const comments = await prisma.comment.findMany({
            where: {
                voicePinId: parseInt(voiceId),
                userId: userId
            }
        });

        res.status(200).json({ comments });
    } catch (err) {
        console.log(err.message);
        throw err
    }
}

