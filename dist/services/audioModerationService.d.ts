import { VoicePinStatus } from '@prisma/client';
/**
 * Converts any audio buffer (e.g., m4a) to a PCM WAV buffer that Azure Speech SDK requires.
 * @param inputBuffer The input audio buffer (from m4a file)
 * @returns A promise that resolves to the WAV format Buffer
 */
export declare function convertToWav(inputBuffer: Buffer): Promise<Buffer>;
export declare function transcribeAudio(audioBuffer: Buffer): Promise<string>;
export declare function moderateText(text: string): Promise<boolean>;
export declare function updateDatabase(postId: number, status: VoicePinStatus, text?: string): Promise<void>;
export declare function processAudioBlob(blobName: string, postId: number, containerName?: string): Promise<void>;
//# sourceMappingURL=audioModerationService.d.ts.map