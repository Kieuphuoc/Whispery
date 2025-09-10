import express from 'express'
import { register, login } from '../controllers/authController.js'
import upload from '../middleware/uploadMiddleware.js'

const router = express.Router()


// Register a new user enpoint auth/register
router.post('/register', upload.single('avatar'), register)

router.post('/login', login)


export default router