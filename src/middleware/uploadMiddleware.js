import multer from "multer";

// Lưu file tạm trong bộ nhớ (RAM)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // giới hạn 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      // Hình ảnh
      "image/jpeg",
      "image/png",
      "image/webp",
      // Âm thanh
      "audio/mpeg",     // .mp3
      "audio/wav",      // .wav
      "audio/x-wav",
      "audio/mp4",      // .m4a, .mp4
      "audio/x-m4a",    // .m4a
      "audio/ogg",      // .ogg
      "audio/webm",
      "video/mp4"      // .webm
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only accept image (jpeg, png, webp) or audio (mp3, wav, m4a, ogg, webm)"));
    }
    cb(null, true);
  }
});

export default upload;
