import { NextResponse } from "next/server";
import {
    BlobSASPermissions,
    StorageSharedKeyCredential,
    generateBlobSASQueryParameters,
} from "@azure/storage-blob";

// Handles POST requests to generate a secure upload URL for Azure Blob Storage
export async function POST(req) {

    // Extract filename and MIME type from the request body
    const { filename, contentType } = await req.json();

    // Read Azure Storage configuration from environment variables
    const account = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
    const container = process.env.AZURE_STORAGE_CONTAINER;

    // Create a unique blob name to avoid filename collisions
    const blobName = `${crypto.randomUUID()}-${filename}`;

    // Create credentials using the storage account name and key
    const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);

    // Set the SAS token expiration time (10 minutes from now)
    const expiresOn = new Date(Date.now() + 10 * 60 * 1000);

    // Generate a SAS token allowing create and write permissions on the blob
    const sas = generateBlobSASQueryParameters(
        {
            containerName: container,
            blobName,
            permissions: BlobSASPermissions.parse("cw"), // create + write only
            expiresOn,
            contentType,
        },
        sharedKeyCredential
    ).toString();

    // URL used by the client to upload the file directly to Azure Blob Storage
    const uploadUrl = `https://${account}.blob.core.windows.net/${container}/${blobName}?${sas}`;

    // Public URL to access the uploaded file after a successful upload
    const publicUrl = `https://${account}.blob.core.windows.net/${container}/${blobName}`;

    // Return both URLs to the client
    return NextResponse.json({ uploadUrl, publicUrl });
}
