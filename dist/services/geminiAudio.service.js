import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import * as fs from 'fs';
// Khởi tạo SDK bằng API Key từ biến môi trường
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);
/**
 * Phân tích lời nói và cảm xúc từ file âm thanh
 * @param audioInput audio Buffer hoặc đường dẫn path
 * @param mimeType Mime type của file audio (vd: 'audio/mp3', 'audio/wav', 'audio/m4a')
 */
export async function analyzeAudioEmotion(audioInput, mimeType) {
    try {
        const responseSchema = {
            type: SchemaType.OBJECT,
            properties: {
                transcript: {
                    type: SchemaType.STRING,
                    description: "Văn bản được giải mã môt cách chính xác từ giọng nói trong file đoạn audio",
                },
                emotion_label: {
                    type: SchemaType.STRING,
                    description: "Nhãn cảm xúc chính xác và rõ ràng của giọng nói (ví dụ: Vui vẻ, Buồn bã, Tức giận, Sợ hãi, Bình thường, Ngạc nhiên, v.v)",
                },
                confidence_score: {
                    type: SchemaType.NUMBER,
                    description: "Độ tin cậy của phân tích cảm xúc hiện tại, giá trị từ 0.0 đến 1.0",
                },
            },
            required: ["transcript", "emotion_label", "confidence_score"],
        };
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
            systemInstruction: "Bạn là một AI chuyên gia về phân tích giọng nói và nhận diện biểu cảm tâm lý người. Nhiệm vụ của bạn là lắng nghe file âm thanh được cung cấp, trích xuất chính xác lời nói thành văn bản (transcript), chỉ ra nhãn cảm xúc chủ đạo (emotion label) bằng tiếng Việt hoặc tiếng Anh tuỳ ngữ cảnh, và đưa ra mức độ tự tin vào đánh giá của bạn (confidence score). Hãy tuân thủ nghiêm ngặt định dạng JSON theo schema đã cấu hình."
        });
        let base64Audio;
        if (Buffer.isBuffer(audioInput)) {
            base64Audio = audioInput.toString("base64");
        }
        else if (typeof audioInput === "string") {
            if (!fs.existsSync(audioInput))
                throw new Error("File âm thanh không tồn tại.");
            base64Audio = fs.readFileSync(audioInput, { encoding: "base64" });
        }
        else {
            throw new Error("Đầu vào âm thanh không hợp lệ. Phải là buffer hoặc string path.");
        }
        const audioPart = {
            inlineData: {
                data: base64Audio,
                mimeType: mimeType,
            },
        };
        const userPrompt = "Hãy phân tích file âm thanh này và xuất kết quả bằng định dạng JSON hợp lệ.";
        const result = await model.generateContent([userPrompt, audioPart]);
        const responseText = result.response.text();
        const finalData = JSON.parse(responseText);
        return finalData;
    }
    catch (error) {
        console.error("Lỗi khi phân tích audio bằng Gemini:", error);
        // Bỏ qua throw lỗi để không chặn toàn bộ quá trình upload pin, chỉ return rỗng
        return {
            transcript: null,
            emotion_label: null,
            confidence_score: null
        };
    }
}
//# sourceMappingURL=geminiAudio.service.js.map