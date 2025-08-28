import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import uploadMiddleware from '../middleware/uploadMiddleware.js'
import { createVoicePin, deleteVoicePin, getAllCommentOfVoicePin, getVoicePin } from '../controllers/voiceController.js';

const router = express.Router()

// Get all voice pint for logged-in user
router.get('/',  authMiddleware, getVoicePin)
// Create a new Voice Pin 
router.post('/', authMiddleware, uploadMiddleware.single("file"),  createVoicePin)

// // Update a Voice Pin
// router.put('/:id', upload.single('audio'), async (req, res) => {
//     const { description, latitude, longitude, visibility, images } = req.body;
//     const { id } = req.params;

//     try {
//         let audioUrl;

//         // Nếu có file audio mới thì upload lên Cloudinary
//         if (req.file) {
//             const result = await new Promise((resolve, reject) => {
//                 const stream = cloudinary.uploader.upload_stream(
//                     { resource_type: 'video', folder: 'voicepin' },
//                     (error, result) => {
//                         if (result) resolve(result);
//                         else reject(error);
//                     }
//                 );
//                 streamifier.createReadStream(req.file.buffer).pipe(stream);
//             });

//             audioUrl = result.secure_url;
//         }

//         await prisma.image.deleteMany({
//             where: { voicePinId: parseInt(id) }
//         });

//         const updatedVoicePin = await prisma.voicePin.update({
//             where: {
//                 id: parseInt(id),
//                 userId: req.userId
//             },
//             data: {
//                 ...(audioUrl && { audioUrl }), 
//                 description: description || '',
//                 latitude: parseFloat(latitude),
//                 longitude: parseFloat(longitude),
//                 visibility: visibility || Visibility.PUBLIC,
//                 images: {
//                     create: JSON.parse(images || '[]').map((url) => ({ url }))
//                 }
//             },
//             include: {
//                 images: true
//             }
//         });

//         res.json({ updatedVoicePin });
//     } catch (err) {
//         console.log(err.message);
//         res.sendStatus(503);
//     }
// });


// Delete a Voice Pin
router.delete('/:id', authMiddleware, deleteVoicePin)

// GET all comments of a voice pin /:id/comment
router.get('/:id/comment',  authMiddleware, getAllCommentOfVoicePin)

// thêm xóa sửa reactions

export default router