"use client"

import { useState, useRef } from "react"
import { uploadToDrive } from "@/lib/uploadToDrive"

type UploadResult = { success: true; fileId: string; fileUrl: string } | { error: string }

export default function GoogleDriveUpload() {
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string }[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setError(null)
    setUploading(true)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const formData = new FormData()
      formData.append("file", file)

      const result = (await uploadToDrive(formData)) as UploadResult

      if ("error" in result) {
        setError(result.error)
      } else if (result.success && result.fileUrl) {
        setUploadedFiles((prev) => [...prev, { name: file.name, url: result.fileUrl }])
      }
    }

    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Google Drive Upload</h1>
      <div className="mb-4">
        <input
          type="file"
          onChange={handleFileChange}
          multiple
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          ref={fileInputRef}
          disabled={uploading}
        />
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {uploading && <p className="text-gray-500 mb-4">Uploading...</p>}
      {uploadedFiles.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Uploaded Files:</h2>
          <ul className="list-disc pl-5">
            {uploadedFiles.map((file, index) => (
              <li key={index} className="mb-2">
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {file.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}


