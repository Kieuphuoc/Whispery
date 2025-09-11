import {
    createVoicePin as createVoicePinService,
    deleteVoicePin as deleteVoicePinService,
    getComment as getCommentService,
    getVoicePin as getVoicePinService,
    updateVoicePin as updateVoicePinService,
    getPublicVoicePin as getPublicVoicePinService,
    getPublicVoicePinByUser as getPublicVoicePinByUserService,
    getMyPublicVoicePins as getMyPublicVoicePinsService,
    getFriendsVisibleVoicePins as getFriendsVisibleVoicePinsService,
    getRetrieveVoicePin as getRetrieveVoicePinService

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

export const getPublicVoicePinByUser = async (req, res) => {
    try {
        const { id } = req.params
        const data = await getPublicVoicePinByUserService(id)
        return res.status(200).json(data)
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}

export const getMyPublicVoicePins = async (req, res) => {
    try {
        const data = await getMyPublicVoicePinsService(req.userId)
        return res.status(200).json(data)
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}


export const getFriendsVisibleVoicePins = async (req, res) => {
    try {
        const data = await getFriendsVisibleVoicePinsService(req.userId)
        return res.status(200).json(data)
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}

export const getRetrieveVoicePin = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await getRetrieveVoicePinService(id);

        if (!data) {
            return res.status(404).json({ message: 'Voice Pin không tồn tại' });
        }

        return res.status(200).json(data);
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};


// Get Voice Pin from user
export const getVoicePin = async (req, res) => {
    try {
        const userId = req.userId
        console.log("userId:", userId)
        const data = await getVoicePinService(userId)
        return res.status(200).json(data)
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}

export const deleteVoicePin = async (req, res) => {
    try {
        const userId = req.userId
        const { id } = req.params
        const data = await deleteVoicePinService(id, userId)
        return res.status(204).json(data)
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}

export const getComment = async (req, res) => {
    try {
        const { id } = req.params
        const data = await getCommentService(id)
        return res.status(200).json(data)
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}