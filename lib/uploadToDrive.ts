"use server"

import { drive, FOLDER_ID } from "../config/google-drive"
import { Readable } from "stream"

export async function uploadToDrive(formData: FormData) {
  const file = formData.get("file") as File

  if (!file) {
    return { error: "No file provided" }
  }

  try {
    // First, verify folder exists and we have access
    try {
      await drive.files.get({
        fileId: FOLDER_ID,
        fields: "id, name",
      })
    } catch (error) {
      console.error("Folder access error:", error)
      return { error: "Cannot access the specified folder. Please check permissions." }
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer()
    const stream = new Readable()
    stream.push(Buffer.from(buffer))
    stream.push(null)

    // Create file metadata
    const fileMetadata = {
      name: file.name,
      parents: [FOLDER_ID],
    }

    // Set up media
    const media = {
      mimeType: file.type,
      body: stream,
    }

    // Upload file
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, webViewLink",
      supportsAllDrives: true,
    })

    if (response.data.id) {
      // Update file permissions to make it accessible
      await drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      })

      return {
        success: true,
        fileId: response.data.id,
        fileUrl: response.data.webViewLink,
      }
    }

    return { error: "Upload failed" }
  } catch (error) {
    console.error("Upload error:", error)
    return { error: "File upload failed. Please check your credentials and permissions." }
  }
}

export async function deleteFromDrive(fileId: string) {
  if (!fileId) {
    return { error: "No file ID provided" }
  }

  try {
    // Attempt to delete the file
    await drive.files.delete({
      fileId: fileId,
      supportsAllDrives: true,
    })

    return {
      success: true,
      message: "File deleted successfully",
    }
  } catch (error) {
    console.error("Delete error:", error)
    return { error: "File deletion failed. Please check your credentials and permissions." }
  }
}