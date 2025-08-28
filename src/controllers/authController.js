import { register as registerService,
         login as loginService
 } from '../services/authService.js'
// Nhận request và trả về response

export const register = async (req, res) => {
    try {
        const { username, password } = req.body
        const data = await registerService(username, password)
        return res.status(200).json(data)
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
}

export const login = async (req, res) => {
      try {
      const { username, password } = req.body
        const data = await loginService(username, password)
        return res.status(200).json(data)
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
}