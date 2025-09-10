import { getMe as getMeService,
         getUserById as getUserByIdService,
         getUserStats as getUserStatsService,
         updateProfile as updateProfileService,
         updateAvatar as updateAvatarService } from '../services/userService.js'

export const getMe = async (req, res) => {
    try {
        const user = await getMeService(req.userId)

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        return res.status(200).json(user)
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params
        const user = await getUserByIdService(id)
        if (!user) return res.status(404).json({ message: 'User not found' })
        return res.status(200).json(user)
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}

export const getUserStats = async (req, res) => {
    try {
        const userId = parseInt(req.params.id || req.userId)
        const data = await getUserStatsService(userId)
        return res.status(200).json(data)
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { displayName } = req.body
        const updated = await updateProfileService(req.userId, displayName)
        return res.status(200).json(updated)
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}

export const updateAvatar = async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ message: 'Avatar file is required' })
        }

        const updated = await updateAvatarService(req.userId, req.file.buffer)

        return res.status(200).json(updated)
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}


