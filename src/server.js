import express from 'express'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'; 
import voiceRoutes from './routes/voiceRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import authRoutes from './routes/authRoutes.js'
const app  = express()
const PORT = process.env.PORT || 5000

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)



app.listen(PORT, ()=> {
    console.log(`Server has started on port ${PORT}`)
})

app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, '../public', 'index.html'))
})

app.use(express.static(path.join(__dirname, '../public')))

//Middleware
app.use(cors());      
app.use(express.json())

//Routes
app.use('/auth', authRoutes)
app.use('/voice', voiceRoutes)
app.use('/comment', commentRoutes)