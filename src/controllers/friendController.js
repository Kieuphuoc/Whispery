import {
  sendFriendRequest,
  respondToFriendRequest,
  cancelFriendRequest,
  removeFriend,
  listFriends,
  listPendingReceived,
  listPendingSent
} from '../services/friendService.js'

export const request = async (req, res) => {
  try {
    const senderId = req.userId
    const { receiverId } = req.body
    const result = await sendFriendRequest(senderId, Number(receiverId))
    res.json(result)
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
}

export const respond = async (req, res) => {
  try {
    const receiverId = req.userId
    const { action } = req.body // 'accept' | 'reject'
    const { id } = req.params
    const result = await respondToFriendRequest(receiverId, Number(id), action)
    res.json(result)
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
}

export const cancel = async (req, res) => {
  try {
    const senderId = req.userId
    const { id } = req.params
    const result = await cancelFriendRequest(senderId, Number(id))
    res.json(result)
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
}

export const remove = async (req, res) => {
  try {
    const userId = req.userId
    const { otherUserId } = req.body
    const result = await removeFriend(userId, Number(otherUserId))
    res.json(result)
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
}

export const list = async (req, res) => {
  try {
    const {id}= req.params
    const result = await listFriends(id)
    res.json(result)
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
}

export const pending = async (req, res) => {
  try {
    const userId = req.userId
    const received = await listPendingReceived(userId)
    const sent = await listPendingSent(userId)
    res.json({ received, sent })
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
}


