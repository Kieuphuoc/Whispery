import prisma from '../prismaClient.js'
import cloudinary from '../config/cloudinary.js'

export const getMe = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true, displayName: true, avatar: true, createdAt: true, updatedAt: true }
    })
    return user
}

export const getUserById = async (id) => {
    const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        select: { id: true, username: true, displayName: true, avatar: true, createdAt: true }
    })
    return user
}

export const getUserStats = async (userId) => {
    const [friendCount, voicePinCount, totalListens] = await Promise.all([
        prisma.friendship.count({ where: { OR: [{ senderId: userId, status: 'ACCEPTED' }, { receiverId: userId, status: 'ACCEPTED' }] } }),
        prisma.voicePin.count({ where: { userId } }),
        prisma.voicePin.aggregate({ where: { userId }, _sum: { listens: true } })
    ])

    return { friendCount, voicePinCount, totalListens: totalListens._sum.listens || 0 }
}

export const updateProfile = async (userId, displayName) => {
    const updated = await prisma.user.update({
        where: { id: userId },
        data: { displayName: displayName ?? null },
        select: { id: true, username: true, displayName: true, avatar: true, updatedAt: true }
    })
    return updated 
}

export const updateAvatar = async (userId, fileBuffer) => {
    const uploadStream = () => new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'image', folder: 'avatars' },
            (error, result) => {
                if (error) return reject(error)
                return resolve(result)
            }
        )
        stream.end(fileBuffer)
    })

    const result = await uploadStream()
    const avatarUrl = result.secure_url

    const updated = await prisma.user.update({
        where: { id: userId },
        data: { avatar: avatarUrl },
        select: { id: true, username: true, displayName: true, avatar: true, updatedAt: true }
    })
    return updated
}


