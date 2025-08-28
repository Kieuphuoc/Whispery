import {
    createComment as createCommentService,
    deleteComment as deleteCommentService,
    updateComment as updateCommentService,

} from '../services/commentService.js'

export const createComment = async (req, res) => {
    try {
        const { content, voicePinId } = req.body
        const { userId } = req.userId
        const data = await createCommentService(content, voicePinId, userId)
        return res.status(200).json(data)
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
}

export const deleteComment = async (req, res) => {
    try {
        const { id } = req.params
        const { userId } = req.userId
        const data = await deleteCommentService(id, userId)
        return res.status(200).json(data)
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
}
export const updateComment = async (req, res) => {
    try {
        const { id } = req.params
        const { content, voicePinId } = req.body

        const { userId } = req.userId
        const data = await updateCommentService(content, id, voicePinId, userId)
        return res.status(200).json(data)
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
}