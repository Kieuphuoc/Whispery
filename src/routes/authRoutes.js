import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../prismaClient.js'

const router = express.Router()


// Register a new user enpoint auth/register
router.post('/register', async(req, res) => {
    const { username, password } = req.body
    const hashedPassword = bcrypt.hashSync(password, 8)

    // Save the new user and hashed password to the db
    try {
        const user = await prisma.user.create({
            data: {
                username, 
                password: hashedPassword
            }
        })

        // Create a token
        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, { expiresIn: '24h' })
        res.json({ token })

    } catch (err) {
        console.log(err.message)
        res.sendStatus(503)  // 500-599 => Fail
    }

})

router.post('/login', async(req, res) => {
    const { username, password }= req.body

    try {
        const user = await prisma.user.findUnique({
            where: {
                username: username // Username in database = username in the body of request
            }
        })
      
        // None user associated with that username
        if (!user) {return  res.status(404).send({ message: "User not found"})}

        const passwordIsValid = bcrypt.compareSync(password, user.password)

        // Password does not match
        if(!passwordIsValid) {return res.status(401).send({message: "Invalid Password"})}
        console.log(user)

        const token = jwt.sign({id:user.id}, process.env.JWT_SECRET, { expiresIn: '24h'})
        res.json({token})

    } catch (err) {
        console.log(err.message)
        res.sendStatus(503)
    }
})


export default router