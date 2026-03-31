import { BlobServiceClient } from '@azure/storage-blob';

const connectionString = process.env.AZURE_BLOB_CONNECTION_STRING;
if (!connectionString) {
    throw new Error('AZURE_BLOB_CONNECTION_STRING is not defined in the environment variables');
}

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerName = 'whisper';
const containerClient = blobServiceClient.getContainerClient(containerName);

// Ensure container exists
containerClient.createIfNotExists({ access: 'blob' }).catch(err => {
    console.error('Failed to create Azure Blob container on startup (network issue?):', err.message);
});

export const uploadToAzure = async (
    fileBuffer: Buffer,
    fileName: string,
    contentType: string,
    folder: string
): Promise<string> => {
    const blobName = `${folder}/${Date.now()}-${fileName}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: { blobContentType: contentType }
    });

    return blockBlobClient.url;
};

export default blobServiceClient;
