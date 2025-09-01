import {
    createVoicePin as createVoicePinService,
    deleteVoicePin as deleteVoicePinService,
    getComment as getCommentService,
    getVoicePin as getVoicePinService,
    updateVoicePin as updateVoicePinService,
 getPublicVoicePin as getPublicVoicePinService
} from '../services/voiceService.js'

export const createVoicePin = async (req, res) => {
    try {
        const fileBuffer = req.file?.buffer
        const userId = req.userId
        const { description, latitude, longitude, visibility, images } = req.body
        const data = await createVoicePinService(description, latitude, longitude, visibility, images, fileBuffer, userId)
        return res.status(200).json(data)
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}

export const updateVoicePin = async (req, res) => {
    try {
        const id = req.params
        const fileBuffer = req.file?.buffer
        const userId = req.userId
        const { description, latitude, longitude, visibility, images } = req.body
        const data = await updateVoicePinService(description, latitude, longitude, visibility, images, fileBuffer, userId, id)
        return res.status(200).json(data)
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}

// Get Public VoicePin 
export const getPublicVoicePin = async (req, res) => {
    try {
        const data = await getPublicVoicePinService()
        return res.status(200).json(data)
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}


// Get Voice Pin from user
export const getVoicePin = async (req, res) => {
    try {
        const { userId } = req.userId
        const data = await getVoicePinService(userId)
        return res.status(200).json(data)
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}

export const deleteVoicePin = async (req, res) => {
    try {
        const { userId } = req.userId
        const { id } = req.params
        const data = await deleteVoicePinService(id, userId)
        return res.status(204).json(data)
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}

export const getComment = async (req, res) => {
    try {
        const { userId } = req.userId
        const { id } = req.params
        const data = await getCommentService(id, userId)
        return res.status(200).json(data)
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}