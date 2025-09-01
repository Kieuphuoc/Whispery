import prisma from '../prismaClient.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const register = async (username, password) => {
    // Save the new user and hashed password to the db
    const hashedPassword = bcrypt.hashSync(password, 8)

    try {
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword
            }
        })

        // Create a token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' })
        return { token }

    } catch (err) {
        console.log(err.message)
        throw err;
    }
}

export const login = async (username, password) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                username: username // Username in database = username in the body of request
            }
        })

        // None user associated with that username
        if (!user) { 
            console.log("No has username")}

        const passwordIsValid = bcrypt.compareSync(password, user.password)

        // Password does not match
        if (!passwordIsValid) { console.log("Incorrect password") }
        console.log(user)

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' })
        return { token }

    } catch (err) {
          console.log(err.message)
        throw err;
    }
}