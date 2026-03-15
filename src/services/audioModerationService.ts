import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import ContentSafetyClient, { isUnexpected } from '@azure-rest/ai-content-safety';
import { AzureKeyCredential } from '@azure/core-auth';
import { BlobServiceClient } from '@azure/storage-blob';
import dotenv from 'dotenv';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { PassThrough } from 'stream';

dotenv.config();

if (typeof ffmpegStatic === 'string') {
    ffmpeg.setFfmpegPath(ffmpegStatic);
}

const connectionString = process.env.AZURE_BLOB_CONNECTION_STRING;
if (!connectionString) {
    throw new Error('AZURE_BLOB_CONNECTION_STRING is not defined');
}
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient('whisper');

/**
 * Converts any audio buffer (e.g., m4a) to a PCM WAV buffer that Azure Speech SDK requires.
 * @param inputBuffer The input audio buffer (from m4a file)
 * @returns A promise that resolves to the WAV format Buffer
 */
export async function convertToWav(inputBuffer: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const passThroughStream = new PassThrough();
        passThroughStream.end(inputBuffer);

        const chunks: Buffer[] = [];
        const outStream = new PassThrough();

        outStream.on('data', (chunk) => {
            chunks.push(chunk);
        });

        outStream.on('end', () => {
            resolve(Buffer.concat(chunks));
        });

        outStream.on('error', (err) => {
            reject(err);
        });

        ffmpeg(passThroughStream)
            // .inputFormat('m4a') // We let ffmpeg guess the input format from the buffer automatically
            .audioCodec('pcm_s16le') // PCM 16-bit encoding
            .audioFrequency(16000)   // 16 kHz sample rate commonly used for speech
            .audioChannels(1)        // Mono channel
            .format('wav')
            .on('error', (err) => {
                console.error('Error during ffmpeg conversion:', err);
                reject(err);
            })
            .pipe(outStream, { end: true });
    });
}

export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
    return new Promise(async (resolve, reject) => {
        const speechKey = process.env.AZURE_SPEECH_KEY;
        const speechRegion = process.env.AZURE_SPEECH_REGION;

        if (!speechKey || !speechRegion) {
            return reject(new Error('Azure Speech configuration is missing.'));
        }

        try {
            console.log("transcribeAudio: converting incoming buffer to PCM WAV...");
            const wavBuffer = await convertToWav(audioBuffer);
            
            const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
            speechConfig.speechRecognitionLanguage = 'vi-VN';

            const pushStream = sdk.AudioInputStream.createPushStream();
            
            // Azure SDK expects an ArrayBuffer. A node Buffer is a Uint8Array.
            // We can get a clean ArrayBuffer by copying the data
            const arrayBuffer = new ArrayBuffer(wavBuffer.length);
            const view = new Uint8Array(arrayBuffer);
            for (let i = 0; i < wavBuffer.length; ++i) {
                view[i] = wavBuffer[i];
            }
            
            pushStream.write(arrayBuffer);
            pushStream.close();

            const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
            const speechRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

            speechRecognizer.recognizeOnceAsync(
                (result) => {
                    let transcription = '';
                    if (result.reason === sdk.ResultReason.RecognizedSpeech) {
                        transcription = result.text;
                    }
                    speechRecognizer.close();
                    resolve(transcription);
                },
                (err) => {
                    speechRecognizer.close();
                    reject(err);
                }
            );
        } catch (error) {
            console.error("transcribeAudio error during conversion/setup:", error);
            reject(error);
        }
    });
}

export async function moderateText(text: string): Promise<boolean> {
    if (!text.trim()) return false;

    const endpoint = process.env.AZURE_CONTENT_SAFETY_ENDPOINT;
    const key = process.env.AZURE_CONTENT_SAFETY_KEY;

    if (!endpoint || !key) {
        console.warn('Azure Content Safety configuration is missing. Skipping moderation.');
        return false;
    }

    const credential = new AzureKeyCredential(key);
    const client = ContentSafetyClient(endpoint, credential);

    try {
        const analyzeTextOption = { text: text };
        const analyzeTextParameters = { body: analyzeTextOption };

        const result = await client.path('/text:analyze').post(analyzeTextParameters);

        if (isUnexpected(result)) {
            throw new Error(`Unexpected result from AI Content Safety: ${result.status}`);
        }

        const categoriesAnalysis = result.body.categoriesAnalysis;

        let isRejected = false;
        if (categoriesAnalysis) {
            for (const category of categoriesAnalysis) {
                // Hate, Violence, SelfHarm, Sexual
                if (category.severity !== undefined && category.severity > 0) {
                    isRejected = true;
                    console.log(`Content rejected due to category ${category.category} with severity ${category.severity}`);
                    break;
                }
            }
        }
        return isRejected;
    } catch (error) {
        console.error('Error in AI Content Safety:', error);
        return false;
    }
}

export async function updateDatabase(postId: string | number, status: string): Promise<void> {
    console.log(`[Database] Post ${postId} status updated to: ${status}`);
    // If the schema includes a status field, we can uncomment and import prismaClient
    // import prisma from '../prismaClient.js';
    // await prisma.voicePin.update({ where: { id: parseInt(postId.toString()) }, data: { status } });
}

export async function processAudioBlob(blobName: string, containerName: string = 'whisper'): Promise<void> {
    try {
        console.log(`Processing audio blob: ${blobName} in container ${containerName}`);
        const customContainerClient = blobServiceClient.getContainerClient(containerName);
        const blobClient = customContainerClient.getBlockBlobClient(blobName);
        
        const properties = await blobClient.getProperties();
        const postId = properties.metadata?.postId || properties.metadata?.postid;

        if (!postId) {
            console.warn(`No postId metadata found for blob: ${blobName}`);
            // Can still transcribe and moderate, but won't update any specific post in DB
        }

        const downloadBlockBlobResponse = await blobClient.downloadToBuffer();
        
        const text = await transcribeAudio(downloadBlockBlobResponse);
        console.log(`Transcribed text: ${text}`);

        if (text) {
             const isRejected = await moderateText(text);
             const status = isRejected ? 'Rejected' : 'Approved';
             
             if (postId) {
                 await updateDatabase(postId, status);
             }
        } else {
             console.log("No text transcribed from the audio.");
        }
    } catch (err) {
        console.error("Error processing audio blob", err);
    }
}
