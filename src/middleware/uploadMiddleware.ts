import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = [
            // Images
            'image/jpeg',
            'image/png',
            'image/webp',
            // Audio
            'audio/mpeg',     // .mp3
            'audio/wav',      // .wav
            'audio/x-wav',
            'audio/mp4',      // .m4a, .mp4
            'audio/x-m4a',    // .m4a
            'audio/ogg',      // .ogg
            'audio/webm',
            'video/mp4'       // .webm
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Only accept image (jpeg, png, webp) or audio (mp3, wav, m4a, ogg, webm)'));
        }
        cb(null, true);
    }
});

export default upload;
