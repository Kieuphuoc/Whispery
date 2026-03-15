import { RequestHandler } from 'express';
/**
 * @swagger
 * components:
 *   schemas:
 *     UserSummary:
 *       type: object
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
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         content:
 *           type: string
 *           example: "Great voice pin!"
 *         audioUrl:
 *           type: string
 *           nullable: true
 *           description: URL of voice comment audio
 *           example: "https://res.cloudinary.com/xxx/comment.mp3"
 *         audioDuration:
 *           type: integer
 *           nullable: true
 *           description: Audio duration in seconds
 *           example: 15
 *         audioSize:
 *           type: integer
 *           nullable: true
 *           description: Audio size in bytes
 *           example: 245000
 *         voicePinId:
 *           type: integer
 *           example: 5
 *         userId:
 *           type: integer
 *           example: 1
 *         parentId:
 *           type: integer
 *           nullable: true
 *           description: Parent comment ID for replies
 *           example: null
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         user:
 *           $ref: '#/components/schemas/UserSummary'
 *     CommentWithReplies:
 *       allOf:
 *         - $ref: '#/components/schemas/Comment'
 *         - type: object
 *           properties:
 *             replies:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *     Pagination:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 20
 *         total:
 *           type: integer
 *           example: 45
 *         totalPages:
 *           type: integer
 *           example: 3
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Error message description"
 */
/**
 * @swagger
 * /comment:
 *   post:
 *     summary: Create a comment (text or voice)
 *     description: Creates a new comment on a voice pin. Supports text comments and voice comments with audio file upload. Can also be used to reply to existing comments.
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - voicePinId
 *             properties:
 *               content:
 *                 type: string
 *                 description: Text content (required if no audio file)
 *                 example: "This is a great voice pin!"
 *               voicePinId:
 *                 type: integer
 *                 description: ID of the voice pin to comment on
 *                 example: 5
 *               parentId:
 *                 type: integer
 *                 description: Parent comment ID for replies (optional)
 *                 example: 10
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Audio file for voice comment (optional)
 *               audioDuration:
 *                 type: integer
 *                 description: Audio duration in seconds
 *                 example: 15
 *               audioSize:
 *                 type: integer
 *                 description: Audio size in bytes
 *                 example: 245000
 *     responses:
 *       200:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *             example:
 *               data:
 *                 id: 1
 *                 content: "Great voice pin!"
 *                 audioUrl: null
 *                 audioDuration: null
 *                 audioSize: null
 *                 voicePinId: 5
 *                 userId: 1
 *                 parentId: null
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *                 user:
 *                   id: 1
 *                   username: "john_doe"
 *                   displayName: "John Doe"
 *                   avatar: "https://res.cloudinary.com/xxx/avatar.jpg"
 *       400:
 *         description: Bad request - content or audio is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Content or audio file is required"
 *       404:
 *         description: Voice pin or parent comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Voice pin not found"
 */
export declare const createComment: RequestHandler;
/**
 * @swagger
 * /comment/{id}:
 *   get:
 *     summary: Get a comment by ID
 *     description: Retrieves a single comment with its replies. Returns full comment details including user info and nested replies.
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Comment ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Comment details with replies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/CommentWithReplies'
 *             example:
 *               data:
 *                 id: 1
 *                 content: "Great voice pin!"
 *                 audioUrl: null
 *                 audioDuration: null
 *                 audioSize: null
 *                 voicePinId: 5
 *                 userId: 1
 *                 parentId: null
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *                 user:
 *                   id: 1
 *                   username: "john_doe"
 *                   displayName: "John Doe"
 *                   avatar: "https://res.cloudinary.com/xxx/avatar.jpg"
 *                 replies:
 *                   - id: 2
 *                     content: "I agree!"
 *                     audioUrl: null
 *                     voicePinId: 5
 *                     userId: 2
 *                     parentId: 1
 *                     createdAt: "2024-01-15T11:00:00.000Z"
 *                     user:
 *                       id: 2
 *                       username: "jane_smith"
 *                       displayName: "Jane Smith"
 *                       avatar: null
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Comment not found"
 */
export declare const getComment: RequestHandler;
/**
 * @swagger
 * /comment/{id}:
 *   delete:
 *     summary: Delete a comment (soft delete)
 *     description: Soft deletes a comment by setting deletedAt timestamp. Only the comment owner can delete their comment. Also decrements the commentsCount on the voice pin.
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Comment ID to delete
 *         example: 1
 *     responses:
 *       204:
 *         description: Comment deleted successfully (no content)
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Not authorized to delete this comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Not authorized to delete this comment"
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Comment not found"
 */
export declare const deleteComment: RequestHandler;
/**
 * @swagger
 * /comment/{id}:
 *   put:
 *     summary: Update a comment
 *     description: Updates the text content of a comment. Only the comment owner can update their comment. Voice comments cannot have their audio changed.
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Comment ID to update
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Updated comment content
 *                 example: "Updated comment text"
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *             example:
 *               data:
 *                 id: 1
 *                 content: "Updated comment text"
 *                 audioUrl: null
 *                 voicePinId: 5
 *                 userId: 1
 *                 parentId: null
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T12:00:00.000Z"
 *                 user:
 *                   id: 1
 *                   username: "john_doe"
 *                   displayName: "John Doe"
 *                   avatar: "https://res.cloudinary.com/xxx/avatar.jpg"
 *       403:
 *         description: Not authorized to update this comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Not authorized to update this comment"
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export declare const updateComment: RequestHandler;
/**
 * @swagger
 * /comment/voice/{voicePinId}:
 *   get:
 *     summary: Get all comments for a voice pin
 *     description: Retrieves paginated list of top-level comments for a voice pin. Each comment includes its replies. Sorted by newest first.
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: voicePinId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Voice pin ID
 *         example: 5
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (1-indexed)
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Items per page
 *         example: 20
 *     responses:
 *       200:
 *         description: Paginated list of comments with replies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CommentWithReplies'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *             example:
 *               data:
 *                 - id: 1
 *                   content: "Great voice pin!"
 *                   audioUrl: null
 *                   voicePinId: 5
 *                   userId: 1
 *                   parentId: null
 *                   createdAt: "2024-01-15T10:30:00.000Z"
 *                   user:
 *                     id: 1
 *                     username: "john_doe"
 *                     displayName: "John Doe"
 *                     avatar: "https://res.cloudinary.com/xxx/avatar.jpg"
 *                   replies:
 *                     - id: 2
 *                       content: "I agree!"
 *                       audioUrl: null
 *                       voicePinId: 5
 *                       userId: 2
 *                       parentId: 1
 *                       createdAt: "2024-01-15T11:00:00.000Z"
 *                       user:
 *                         id: 2
 *                         username: "jane_smith"
 *                         displayName: "Jane"
 *                         avatar: null
 *               pagination:
 *                 page: 1
 *                 limit: 20
 *                 total: 45
 *                 totalPages: 3
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export declare const getCommentsByVoicePin: RequestHandler;
/**
 * @swagger
 * /comment/{id}/replies:
 *   get:
 *     summary: Get replies to a comment
 *     description: Retrieves all replies to a specific comment. Sorted by oldest first to show conversation flow.
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Parent comment ID
 *         example: 1
 *     responses:
 *       200:
 *         description: List of replies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *             example:
 *               data:
 *                 - id: 2
 *                   content: "I agree!"
 *                   audioUrl: null
 *                   audioDuration: null
 *                   audioSize: null
 *                   voicePinId: 5
 *                   userId: 2
 *                   parentId: 1
 *                   createdAt: "2024-01-15T11:00:00.000Z"
 *                   updatedAt: "2024-01-15T11:00:00.000Z"
 *                   user:
 *                     id: 2
 *                     username: "jane_smith"
 *                     displayName: "Jane Smith"
 *                     avatar: null
 *                 - id: 3
 *                   content: "Me too!"
 *                   audioUrl: null
 *                   voicePinId: 5
 *                   userId: 3
 *                   parentId: 1
 *                   createdAt: "2024-01-15T11:30:00.000Z"
 *                   updatedAt: "2024-01-15T11:30:00.000Z"
 *                   user:
 *                     id: 3
 *                     username: "bob_wilson"
 *                     displayName: "Bob"
 *                     avatar: "https://res.cloudinary.com/xxx/bob.jpg"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export declare const getReplies: RequestHandler;
//# sourceMappingURL=commentController.d.ts.map