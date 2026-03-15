import { RequestHandler } from 'express';
/**
 * @swagger
 * components:
 *   schemas:
 *     FriendUser:
 *       type: object
 *       description: User info for friend-related responses
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         username:
 *           type: string
 *           example: "john_doe"
 *         displayName:
 *           type: string
 *           nullable: true
 *           example: "John Doe"
 *         avatar:
 *           type: string
 *           nullable: true
 *           example: "https://res.cloudinary.com/xxx/avatar.jpg"
 *         level:
 *           type: integer
 *           description: User's gamification level
 *           example: 5
 *     Friendship:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         senderId:
 *           type: integer
 *           example: 1
 *         receiverId:
 *           type: integer
 *           example: 2
 *         status:
 *           type: string
 *           enum: [PENDING, ACCEPTED, REJECTED, BLOCKED]
 *           example: "PENDING"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         sender:
 *           $ref: '#/components/schemas/FriendUser'
 *         receiver:
 *           $ref: '#/components/schemas/FriendUser'
 *     FriendshipStatus:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [none, pending_sent, pending_received, friends, blocked_by_you, blocked, rejected, self]
 *           description: |
 *             - none: No relationship exists
 *             - pending_sent: You sent a request, waiting for response
 *             - pending_received: They sent you a request
 *             - friends: Accepted friendship
 *             - blocked_by_you: You blocked them
 *             - blocked: They blocked you
 *             - rejected: Request was rejected
 *             - self: Same user (viewing own profile)
 *           example: "friends"
 *         friendshipId:
 *           type: integer
 *           nullable: true
 *           description: ID of the friendship record (null if no relationship)
 *           example: 5
 *     PendingRequests:
 *       type: object
 *       properties:
 *         received:
 *           type: array
 *           description: Friend requests received from others
 *           items:
 *             $ref: '#/components/schemas/Friendship'
 *         sent:
 *           type: array
 *           description: Friend requests you sent to others
 *           items:
 *             $ref: '#/components/schemas/Friendship'
 */
/**
 * @swagger
 * /friend/request:
 *   post:
 *     summary: Send a friend request
 *     description: Sends a friend request to another user. Cannot send to yourself, existing friends, or blocked users. If a previous request was rejected, this will re-send it.
 *     tags: [Friend]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *             properties:
 *               receiverId:
 *                 type: integer
 *                 description: ID of user to send friend request to
 *                 example: 2
 *     responses:
 *       200:
 *         description: Friend request sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Friendship'
 *             example:
 *               data:
 *                 id: 1
 *                 senderId: 1
 *                 receiverId: 2
 *                 status: "PENDING"
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *                 sender:
 *                   id: 1
 *                   username: "john_doe"
 *                   displayName: "John Doe"
 *                   avatar: "https://res.cloudinary.com/xxx/john.jpg"
 *                   level: 5
 *                 receiver:
 *                   id: 2
 *                   username: "jane_smith"
 *                   displayName: "Jane Smith"
 *                   avatar: null
 *                   level: 3
 *       400:
 *         description: Cannot friend yourself, request already pending, or already friends
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               self:
 *                 value:
 *                   message: "Cannot friend yourself"
 *               pending:
 *                 value:
 *                   message: "Request already pending"
 *               friends:
 *                 value:
 *                   message: "Already friends"
 *               blocked:
 *                 value:
 *                   message: "Cannot send request"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "User not found"
 */
export declare const request: RequestHandler;
/**
 * @swagger
 * /friend/request/{id}/respond:
 *   post:
 *     summary: Respond to a friend request
 *     description: Accept or reject a pending friend request. Only the receiver of the request can respond.
 *     tags: [Friend]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Friend request ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [accept, reject]
 *                 description: Action to take on the request
 *                 example: "accept"
 *     responses:
 *       200:
 *         description: Response recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Friendship'
 *             example:
 *               data:
 *                 id: 1
 *                 senderId: 2
 *                 receiverId: 1
 *                 status: "ACCEPTED"
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T11:00:00.000Z"
 *                 sender:
 *                   id: 2
 *                   username: "jane_smith"
 *                   displayName: "Jane Smith"
 *                   avatar: null
 *                   level: 3
 *                 receiver:
 *                   id: 1
 *                   username: "john_doe"
 *                   displayName: "John Doe"
 *                   avatar: "https://res.cloudinary.com/xxx/john.jpg"
 *                   level: 5
 *       400:
 *         description: Invalid action or request already handled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalid_action:
 *                 value:
 *                   message: "Invalid action. Use \"accept\" or \"reject\""
 *               already_handled:
 *                 value:
 *                   message: "Request already handled"
 *       403:
 *         description: Not authorized to respond to this request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Not authorized to respond"
 *       404:
 *         description: Request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Request not found"
 */
export declare const respond: RequestHandler;
/**
 * @swagger
 * /friend/request/{id}:
 *   delete:
 *     summary: Cancel a pending friend request
 *     description: Cancels a friend request that you sent. Only the sender can cancel, and only while the request is still pending.
 *     tags: [Friend]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Friend request ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Request cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Request cancelled successfully"
 *       400:
 *         description: Only pending requests can be cancelled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Only pending requests can be cancelled"
 *       403:
 *         description: Not authorized to cancel this request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Not authorized to cancel"
 *       404:
 *         description: Request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Request not found"
 */
export declare const cancel: RequestHandler;
/**
 * @swagger
 * /friend/remove:
 *   delete:
 *     summary: Remove a friend
 *     description: Removes an existing friendship. Either party can remove the friendship.
 *     tags: [Friend]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otherUserId
 *             properties:
 *               otherUserId:
 *                 type: integer
 *                 description: ID of friend to remove
 *                 example: 2
 *     responses:
 *       200:
 *         description: Friend removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Friend removed successfully"
 *       404:
 *         description: Friendship not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Friendship not found"
 */
export declare const remove: RequestHandler;
/**
 * @swagger
 * /friend/block:
 *   post:
 *     summary: Block a user
 *     description: Blocks a user. If a friendship or request exists, it will be converted to blocked status. Blocked users cannot see your voice pins or send you friend requests.
 *     tags: [Friend]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of user to block
 *                 example: 3
 *     responses:
 *       200:
 *         description: User blocked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Friendship'
 *                 message:
 *                   type: string
 *                   example: "User blocked successfully"
 *             example:
 *               data:
 *                 id: 5
 *                 senderId: 1
 *                 receiverId: 3
 *                 status: "BLOCKED"
 *                 createdAt: "2024-01-15T12:00:00.000Z"
 *                 updatedAt: "2024-01-15T12:00:00.000Z"
 *               message: "User blocked successfully"
 *       400:
 *         description: Cannot block yourself
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Cannot block yourself"
 */
export declare const block: RequestHandler;
/**
 * @swagger
 * /friend/unblock:
 *   post:
 *     summary: Unblock a user
 *     description: Removes a block on a user. Only the user who initiated the block can unblock.
 *     tags: [Friend]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of user to unblock
 *                 example: 3
 *     responses:
 *       200:
 *         description: User unblocked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User unblocked successfully"
 *       404:
 *         description: Block relationship not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Block relationship not found"
 */
export declare const unblock: RequestHandler;
/**
 * @swagger
 * /friend/list/{id}:
 *   get:
 *     summary: List user's friends
 *     description: Returns all accepted friends for a specific user.
 *     tags: [Friend]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID to get friends for
 *         example: 1
 *     responses:
 *       200:
 *         description: List of friends
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FriendUser'
 *             example:
 *               data:
 *                 - id: 2
 *                   username: "jane_smith"
 *                   displayName: "Jane Smith"
 *                   avatar: "https://res.cloudinary.com/xxx/jane.jpg"
 *                   level: 3
 *                 - id: 5
 *                   username: "bob_wilson"
 *                   displayName: "Bob"
 *                   avatar: null
 *                   level: 7
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export declare const list: RequestHandler;
/**
 * @swagger
 * /friend/pending:
 *   get:
 *     summary: List pending friend requests
 *     description: Returns both received and sent pending friend requests for the authenticated user.
 *     tags: [Friend]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending requests separated by received and sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/PendingRequests'
 *             example:
 *               data:
 *                 received:
 *                   - id: 10
 *                     senderId: 5
 *                     receiverId: 1
 *                     status: "PENDING"
 *                     createdAt: "2024-01-15T09:00:00.000Z"
 *                     sender:
 *                       id: 5
 *                       username: "new_friend"
 *                       displayName: "New Friend"
 *                       avatar: null
 *                       level: 2
 *                 sent:
 *                   - id: 8
 *                     senderId: 1
 *                     receiverId: 3
 *                     status: "PENDING"
 *                     createdAt: "2024-01-14T15:00:00.000Z"
 *                     receiver:
 *                       id: 3
 *                       username: "bob_wilson"
 *                       displayName: "Bob"
 *                       avatar: "https://res.cloudinary.com/xxx/bob.jpg"
 *                       level: 7
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export declare const pending: RequestHandler;
/**
 * @swagger
 * /friend/status/{userId}:
 *   get:
 *     summary: Get friendship status with another user
 *     description: Returns the current relationship status between the authenticated user and another user.
 *     tags: [Friend]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Other user's ID
 *         example: 2
 *     responses:
 *       200:
 *         description: Friendship status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/FriendshipStatus'
 *             examples:
 *               friends:
 *                 value:
 *                   data:
 *                     status: "friends"
 *                     friendshipId: 5
 *               pending_sent:
 *                 value:
 *                   data:
 *                     status: "pending_sent"
 *                     friendshipId: 10
 *               pending_received:
 *                 value:
 *                   data:
 *                     status: "pending_received"
 *                     friendshipId: 10
 *               none:
 *                 value:
 *                   data:
 *                     status: "none"
 *                     friendshipId: null
 *               self:
 *                 value:
 *                   data:
 *                     status: "self"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export declare const getStatus: RequestHandler;
/**
 * @swagger
 * /friend/blocked:
 *   get:
 *     summary: List blocked users
 *     description: Returns all users that the authenticated user has blocked.
 *     tags: [Friend]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of blocked users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       username:
 *                         type: string
 *                       displayName:
 *                         type: string
 *                         nullable: true
 *                       avatar:
 *                         type: string
 *                         nullable: true
 *             example:
 *               data:
 *                 - id: 10
 *                   username: "blocked_user"
 *                   displayName: "Blocked User"
 *                   avatar: null
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export declare const getBlockedUsers: RequestHandler;
//# sourceMappingURL=friendController.d.ts.map