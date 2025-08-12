import jwt from 'jsonwebtoken'

function authMiddleware (req, res, next) {
    const token = req.headers['authorization']
 
    // Find token
    if (!token) {
        // 401 - Unauthorized
        return res.status(401).json({message: "No token provided"})
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) { 
            return res.status(401).json({ message: "Invalid token"})
        }

        req.userId = decoded.id
        next() // Run other route/middleware when this middleware done
    })
}

export default authMiddleware