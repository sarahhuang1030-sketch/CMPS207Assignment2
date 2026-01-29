import { NextResponse } from "next/server";
import {
  BlobSASPermissions,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";

export async function POST(req) {
  const { filename, contentType } = await req.json();

  const account = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
  const container = process.env.AZURE_STORAGE_CONTAINER;

  const blobName = `${crypto.randomUUID()}-${filename}`;

  const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);

  const expiresOn = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  const sas = generateBlobSASQueryParameters(
    {
      containerName: container,
      blobName,
      permissions: BlobSASPermissions.parse("cw"), // create + write
      expiresOn,
      contentType,
    },
    sharedKeyCredential
  ).toString();

  const uploadUrl = `https://${account}.blob.core.windows.net/${container}/${blobName}?${sas}`;
  const publicUrl = `https://${account}.blob.core.windows.net/${container}/${blobName}`;

  return NextResponse.json({ uploadUrl, publicUrl });
}
