import express from 'express'
import prisma from '../prismaClient.js'

const router = express.Router()

// Get all voice pint for logged-in user
router.get('/', async (req, res) => {
    const voicePin = await prisma.voicePin.findMany({
        where: {
            userId: req.userId
        }
    })
    res.json(voicePin)
})

// Create a new Voice Pin 
router.post('/', async (req, res) => {
    const { audioUrl, description, latitude, longtitude, visibility } = req.body;
    const { file } = req.file;
    try {
        const voicePin = await prisma.voicePin.create({
            data: {
                audioUrl,
                description: description || '',
                latitude,
                visibility, // ở đây là kiểu enum thì sao
                userId: req.userId
                // còn hình ảnh là một  [] thì thêm như nào?
            }
        })
        res.json(voicePin)

    } catch(err){
        console.log(err.message)
        res.sendStatus(503)
    }
})


// Update a Voice Pin
router.put('/:id', async(req, res) => {
})

// Delete a Voice Pin
router.delete('/:id', async(req, res) => {
    const { id } = req.params;

    try {
        await prisma.voicePin.delete({
            where: {
                id: parseInt(id),
                userId: req.userId
            }
        })
        res.sendStatus(200)
    }catch(err) {
        console.log(err.message)
        res.sendStatus(503)
    }
})

// GET all comments of a voice pin /:id/comment
router.get('/', async (req, res) => {
    try {
        const comment = await prisma.comment.findMany({
            where :{
                userId: req.userId,
            }
        })
    } catch (err) {
        console.log(err.message)
        res.sendStatus(503)
    }
})

// POST a comments for a voice pin /:id/comment

// DELETE a comment of a voice pin /comment/commentId

// thêm xóa sửa reactions

export default router