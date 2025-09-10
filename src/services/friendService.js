import prisma from '../prismaClient.js'

export const sendFriendRequest = async (senderId, receiverId) => {
  if (senderId === receiverId) {
    throw new Error('Cannot friend yourself')
  }

  // Ensure deterministic order: only allow one direction unique
  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }
  })

  if (existing) {
    if (existing.status === 'PENDING') throw new Error('Request already pending')
    if (existing.status === 'ACCEPTED') throw new Error('Already friends')
    // If rejected previously, allow re-send by updating
    return prisma.friendship.update({
      where: { id: existing.id },
      data: { senderId, receiverId, status: 'PENDING' }
    })
  }

  return prisma.friendship.create({
    data: { senderId, receiverId, status: 'PENDING' }
  })
}

export const respondToFriendRequest = async (receiverId, requestId, action) => {
  const request = await prisma.friendship.findUnique({ where: { id: requestId } })
  if (!request) throw new Error('Request not found')
  if (request.receiverId !== receiverId) throw new Error('Not authorized to respond')
  if (request.status !== 'PENDING') throw new Error('Request already handled')

  const status = action === 'accept' ? 'ACCEPTED' : action === 'reject' ? 'REJECTED' : null
  if (!status) throw new Error('Invalid action')

  return prisma.friendship.update({
    where: { id: requestId },
    data: { status }
  })
}

export const cancelFriendRequest = async (senderId, requestId) => {
  const request = await prisma.friendship.findUnique({ where: { id: requestId } })
  if (!request) throw new Error('Request not found')
  if (request.senderId !== senderId) throw new Error('Not authorized to cancel')
  if (request.status !== 'PENDING') throw new Error('Only pending can be canceled')
  return prisma.friendship.delete({ where: { id: requestId } })
}

export const removeFriend = async (userId, otherUserId) => {
  const existing = await prisma.friendship.findFirst({
    where: {
      status: 'ACCEPTED',
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    }
  })
  if (!existing) throw new Error('Friendship not found')
  return prisma.friendship.delete({ where: { id: existing.id } })
}

export const listFriends = async (userId) => {
  const relations = await prisma.friendship.findMany({
    where: {
      status: 'ACCEPTED',
      OR: [{ senderId: userId }, { receiverId: userId }]
    },
    include: { sender: true, receiver: true }
  })

  return relations.map(r => (r.senderId === userId ? r.receiver : r.sender))
}

export const listPendingReceived = async (userId) => {
  return prisma.friendship.findMany({
    where: { receiverId: userId, status: 'PENDING' },
    include: { sender: true }
  })
}

export const listPendingSent = async (userId) => {
  return prisma.friendship.findMany({
    where: { senderId: userId, status: 'PENDING' },
    include: { receiver: true }
  })
}


