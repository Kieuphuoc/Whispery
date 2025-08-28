import express from 'express'
import { register, login } from '../controllers/authController.js'

const router = express.Router()


// Register a new user enpoint auth/register
router.post('/register', register)

router.post('/login', login)


export default router