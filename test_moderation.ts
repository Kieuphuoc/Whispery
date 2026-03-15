import { transcribeAudio, moderateText } from './src/services/audioModerationService.js';
import * as fs from 'fs';
import * as path from 'path';

async function runTest() {
    console.log("=== Bắt đầu test Audio Moderation ===");

    // Đường dẫn tới file audio test (bạn cần chuẩn bị một file WAV hoặc MP3 có giọng nói tiếng Việt)
    // Ví dụ: file "test_audio.m4a" nằm ở thư mục hiện tại
    const audioFilePath = path.join(process.cwd(), 'test_audio.m4a');

    // 1. Kiểm tra file có tồn tại không
    if (!fs.existsSync(audioFilePath)) {
        console.error(`\nLỖI: Không tìm thấy file audio tại: ${audioFilePath}`);
        console.log("-> Vui lòng chép một đoạn ghi âm tiếng Việt vào thư mục hiện tại và đặt tên là 'test_audio.m4a'");
        return;
    }

    try {
        // 2. Đọc file thành Buffer
        console.log(`\n1. Đang đọc file audio: ${audioFilePath}...`);
        const audioBuffer = fs.readFileSync(audioFilePath);

        // 3. Test Speech-to-Text
        console.log("\n2. Gửi lên Azure Speech-to-Text để nhận dạng (vi-VN)...");
        const transcribedText = await transcribeAudio(audioBuffer);

        console.log("\n--- KẾT QUẢ NHẬN DẠNG ---");
        console.log(transcribedText ? `"${transcribedText}"` : "(Không nhận dạng được giọng nói nào)");
        console.log("-----------------------");

        if (!transcribedText) {
            console.log("\nKhông có văn bản để content moderation.");
            return;
        }

        // 4. Test Content Safety
        console.log("\n3. Đang kiểm tra nội dung (Content Safety) với đoạn text trên...");
        const isRejected = await moderateText(transcribedText);

        console.log("\n--- KẾT QUẢ KIỂM DUYỆT ---");
        if (isRejected) {
            console.log("❌ NỘI DUNG BỊ TỪ CHỐI (Không an toàn - chứa ngôn từ vi phạm)");
        } else {
            console.log("✅ NỘI DUNG ĐƯỢC CHẤP NHẬN (An toàn)");
        }
        console.log("------------------------");

    } catch (error) {
        console.error("\n❌ LỖI TRONG QUÁ TRÌNH TEST:", error);
    }
}

runTest();
