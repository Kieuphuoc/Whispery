import prisma from '../prismaClient.js'

// POST a comments
export const createComment = async (content, voicePinId, userId) => {
    try {

        const comment = await prisma.comment.create({
            data: {
                content,
                userId: userId,
                voicePinId,
            }
        })
        return { comment }
    } catch (err) {
        console.log(err.message)
        throw err
    }

}

// DELETE a comment
export const deleteComment = async (commentId, userId) => {
    try {
        await prisma.comment.deleteMany({ // When Delete using two key = deleteMany
            where: {
                id: parseInt(commentId),
                userId: userId
            }
        })
    } catch (err) {
        console.log(err.message)
        throw err
    }
}

// UPDATE a comment /:id/

export const updateComment = async (content, commentId, voicePinId, userId) => {
    try {
        const comment = await prisma.comment.update({
            where: {
                id: parseInt(commentId),
                userId: userId
            },
            data: {
                content,
                userId: userId,
                voicePinId,
            }
        })
        return { comment }

    } catch (err) {
        console.log(err.message)
        throw err
    }
}