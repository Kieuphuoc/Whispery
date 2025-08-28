import {
    createVoicePin as createVoicePinService,
    deleteVoicePin as deleteVoicePinService,
    getAllCommentOfVoicePin as getAllCommentOfVoicePinService,
    getVoicePin as getVoicePinService
} from '../services/voiceService.js'

export const createVoicePin = async (req, res) => {
    try {
        const { userId } = req.userId
        const { description, latitude, longitude, visibility, images } = req.body
        const data = await createVoicePinService(description, latitude, longitude, visibility, images)
        return res.status(200).json(data)
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}

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
    try{
           const { userId } = req.userId    
           const { id } = req.params
           const data = await deleteVoicePinService(id, userId)
           return res.status(204).json(data)
    }catch(err) {
        return res.status(400).json({message: err.message})
    }
}

export const getAllCommentOfVoicePin = async (req, res) => {
    try {
           const { userId } = req.userId 
           const { id } = req.params
           const data = await getAllCommentOfVoicePinService(id, userId)
           return res.status(200).json(data)   
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}