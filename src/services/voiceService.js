import prisma from '../prismaClient.js'
import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary.js'
import { Visibility } from '@prisma/client';


export const createVoicePin = async (description, latitude, longitude, visibility, images, fileBuffer, userId) => {
    try {
        const streamUpload = (buffer) => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'auto',
                        folder: "voicepin"
                    },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                uploadStream.end(buffer);
            });
        };

        const result = await streamUpload(fileBuffer);
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

        return { data: voicePin };

    } catch (err) {
        console.log("Upload voice pin error:", err.message);
        throw err;
    }
}

// Update VoicePin
export const updateVoicePin = async (description, latitude, longitude, visibility, images, fileBuffer, userId, voicePinId) => {
    try {
        const streamUpload = (buffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'video',
                        folder: "voicepin"
                    },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );

                streamifier.createReadStream(buffer).pipe(stream);
            });
        };

        const result = await streamUpload(fileBuffer);
        const audioUrl = result.secure_url;

        const voicePin = await prisma.voicePin.update({
            where: {
                id: parseInt(voicePinId),
                userId: userId
            },
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

        return { data: voicePin };

    } catch (err) {
        console.log(err.message);
        throw err
    }
}

export const getPublicVoicePin = async () => {
    try {
        const voicePin = await prisma.voicePin.findMany({
            where: { visibility: 'PUBLIC' },
            include: {
                user: {
                    select: {
                        username: true,
                        // avatar: true, 
                    }
                }
            }
        });
        return { data: voicePin };
    } catch (err) {
        console.log(err.message);
        throw err;
    }
};


export const getVoicePin = async (userId) => {
    try {
        const voicePin = await prisma.voicePin.findMany({
            where: {
                userId: userId
            }
        })

        return { data: voicePin }
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
        return { data: voicePin }
    } catch (err) {
        console.log(err.message);
        throw err
    }
}

export const getComment = async (voiceId, userId) => {
    try {
        const comments = await prisma.comment.findMany({
            where: {
                voicePinId: parseInt(voiceId),
                userId: userId
            }
        });

        return { data: comments };
    } catch (err) {
        console.log(err.message);
        throw err
    }
}

