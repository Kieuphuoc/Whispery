import { BlobServiceClient } from '@azure/storage-blob';
declare const blobServiceClient: BlobServiceClient;
export declare const uploadToAzure: (fileBuffer: Buffer, fileName: string, contentType: string, folder: string) => Promise<string>;
export default blobServiceClient;
//# sourceMappingURL=azureStorage.d.ts.map