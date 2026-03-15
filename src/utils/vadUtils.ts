import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { PassThrough } from 'stream';

if (typeof ffmpegStatic === 'string') {
    ffmpeg.setFfmpegPath(ffmpegStatic);
}

export async function checkVoiceActivityAndSize(buffer: Buffer, maxSizeMB: number = 10): Promise<{ isValid: boolean; reason?: string }> {
    // 1. Check size
    const sizeMB = buffer.length / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
        return { isValid: false, reason: `File size exceeds ${maxSizeMB}MB limit` };
    }


    // 2. Check audio amplitude (VAD - Volume Activity Detection)
    return new Promise((resolve) => {
        const passThroughStream = new PassThrough();
        passThroughStream.end(buffer);

        ffmpeg(passThroughStream)
            .outputOptions(['-af', 'volumedetect', '-f', 'null'])
            .output('-')
            .on('end', (stdout: string | null, stderr: string | null) => {
                if (!stderr) return resolve({ isValid: true });
                const maxVolumeMatch = stderr.match(/max_volume:\s+([-\d.]+)\s+dB/);
                if (maxVolumeMatch && maxVolumeMatch[1]) {
                    const maxVolume = parseFloat(maxVolumeMatch[1]);
                    // If the max volume is less than -40 dB, it's mostly silence
                    if (maxVolume < -40) {
                        return resolve({ isValid: false, reason: 'Audio is too quiet or empty (silence detected)' });
                    }
                }
                resolve({ isValid: true });
            })
            .on('error', (err: Error) => {
                console.error('VAD check error:', err);
                // On error, let it pass rather than blocking the user
                resolve({ isValid: true });
            })
            .run();
    });
}
