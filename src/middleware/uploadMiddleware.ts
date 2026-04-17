import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 20 * 1024 * 1024 // 20MB limit
    },
    fileFilter: (_req, file, cb) => {
        console.log(`[UPLOAD] Mimetype: ${file.mimetype}, OriginalName: ${file.originalname}`);
        const allowedTypes = [
            // Images
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/heic',
            'image/heif',
            'image/gif',
            // Audio
            'audio/mpeg',     // .mp3
            'audio/wav',      // .wav
            'audio/x-wav',
            'audio/mp4',      // .m4a, .mp4
            'audio/x-m4a',    // .m4a
            'audio/m4a',      // .m4a
            'audio/ogg',      // .ogg
            'audio/webm',
            'video/mp4'       // .mp4
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Only accept image (jpeg, png, webp, heic, heif, gif) or audio (mp3, wav, m4a, ogg, webm)'));
        }
        cb(null, true);
    }
});

export default upload;
