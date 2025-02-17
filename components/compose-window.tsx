// "use client"

// import { useMemo, useState } from "react"
// import dynamic from "next/dynamic"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Minus, X, Maximize2, Minimize2, Send } from "lucide-react"
// import { cn } from "@/lib/utils"
// import "react-quill/dist/quill.snow.css"

// const modules = {
//     toolbar: [
//       [{ font: [] }, { size: [] }],
//       ["bold", "italic", "underline", "strike"],
//       [{ color: [] }, { background: [] }],
//       [{ script: "sub" }, { script: "super" }],
//       [{ header: "1" }, { header: "2" }, "blockquote", "code-block"],
//       [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
//       [{ direction: "rtl" }, { align: [] }],
//       ["link", "image", "video", "formula"],
//       ["clean"],
//       ["table"],
//     ],
//   }


// const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })

// interface ComposeWindowProps {
//   onClose: () => void
//   minimized?: boolean
//   onMinimize?: () => void
//   onMaximize?: () => void
// }

// export function ComposeWindow({ onClose, minimized = false, onMinimize, onMaximize }: ComposeWindowProps) {
//   const [content, setContent] = useState("")
//   const [isMaximized, setIsMaximized] = useState(false)

//   const handleMaximize = () => {
//     setIsMaximized(!isMaximized)
//     onMaximize?.()
//   }

//   const memoizedModules = useMemo(() => modules, [])

//   return (
//     <div
//       className={cn(
//         "fixed bottom-0 right-24 z-50 flex flex-col rounded-t-lg border bg-background shadow-2xl transition-all duration-200 bg-white",
//         isMaximized ? "h-[90vh] w-[50vw]" : "w-[510px]",
//         minimized ? "h-[48px]" : "h-[600px]",
//       )}
//     >
//       {/* Header */}
//       <div className="flex items-center justify-between border-b px-4 py-2">
//         <h3 className="text-sm font-semibold">New Message</h3>
//         <div className="flex items-center gap-1">
//           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onMinimize}>
//             <Minus className="h-4 w-4" />
//           </Button>
//           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleMaximize}>
//             {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
//           </Button>
//           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
//             <X className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>

//       {/* Content */}
//       {!minimized && (
//         <>
//           <div className="flex flex-col border-b bg-black">
//             <Input placeholder="Recipients" className=" border-b outline-none rounded-none focus-visible:ring-0" />
//             <Input placeholder="Subject" className="border-none outline-none rounded-none focus-visible:ring-0" />
//           </div>

//           <div className="flex-1 overflow-hidden">
//             <ReactQuill theme="snow" value={content} onChange={setContent} className="h-full bg-whit" modules={memoizedModules} />
//           </div>

//           <div className="flex items-center justify-between border-t p-2">
//             <Button className="gap-2">
//               <Send className="h-4 w-4" />
//               Send
//             </Button>
//           </div>
//         </>
//       )}
//     </div>
//   )
// }



"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getDirectDownloadLink } from "@/lib/helper"
import { deleteFromDrive, uploadToDrive } from "@/lib/uploadToDrive"
import { cn } from "@/lib/utils"
import { Loader2, Maximize2, Minimize2, Minus, Paperclip, Send, X } from "lucide-react"
import dynamic from "next/dynamic"
import { useEffect, useMemo, useRef, useState } from "react"
import "react-quill/dist/quill.snow.css"
import EmailInput, { EmailTag } from "./email-input"
import { sendEmail } from "@/lib/sendEmail"
import { toast } from "@/hooks/use-toast"


const modules = {
  toolbar: [
    [{ font: [] }, { size: [] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ header: "1" }, { header: "2" }, "blockquote", "code-block"],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }, { align: [] }],
    ["link", "image", "video", "formula"],
    ["clean"],
    ["table"],
  ],
}

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })

interface ComposeWindowProps {
  onClose: () => void
  minimized?: boolean
  onMinimize?: () => void
  onMaximize?: () => void
}

interface Attachment {
  filename: string
  path: string
  fileId: string
  size?: number
  type?: string
}

// Placeholder for the uploadToDrive function.  Replace with your actual implementation.

export function ComposeWindow({ onClose, minimized = false, onMinimize, onMaximize }: ComposeWindowProps) {
  const [isMaximized, setIsMaximized] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedTags, setSelectedTags] = useState<EmailTag[]>([])
  const [deletingStates, setDeletingStates] = useState<{ [key: number]: boolean }>({})
  const [sendDisable, setSendDisable] = useState(true);
  const [isSending, setIsSending] = useState(false)
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const finalAttachments = attachments.map((item) => (
    {
      filename: item.filename,
      path: item.path
    }
  ))
  const recipients = selectedTags.map((recipients) => (recipients.email))



  useEffect(() => {
    if (!subject || !content || recipients.length === 0) {
      setSendDisable(true)
    } else {
      setSendDisable(false)
    }
  }, [subject, content, recipients])


  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)

    const finalAttachments = attachments.map((item) => ({
      filename: item.filename,
      path: item.path,
    }))
    const recipients = selectedTags.map((recipient) => recipient.email)

    try {
      const result = await sendEmail({
        subject,
        content,
        recipients,
        attachments: finalAttachments,
      })

      if (result.success) {
        toast({
          title: "Success",
          description: `Email sent to ${result.recipients!.join(", ")}`,
        })
        // Reset form
        setSubject("")
        setContent("")
        setAttachments([])
        setSelectedTags([])
      } 
      else if (result.authUrl) {
        // If we need authentication, redirect to the auth URL
        window.location.href = result.authUrl
      }
      else {
        throw new Error(result.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send email",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleMaximize = () => {
    setIsMaximized(!isMaximized)
    onMaximize?.()
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append("file", file)

        // Assuming uploadToDrive returns { success: true, fileUrl: string }
        const result = await uploadToDrive(formData)

        if (result.success && result.fileUrl) {
          const downloadUrl = getDirectDownloadLink(result.fileUrl)
          if (downloadUrl) {
            setAttachments((prev) => [
              ...prev,
              {
                filename: file.name,
                path: downloadUrl,
                fileId: result.fileId,
                size: file.size,
                type: file.type,
              },
            ])
          }
        }
      }
    } catch (error) {
      console.error("Error uploading files:", error)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeAttachment = async (index: number) => {
    const attachment = attachments[index]
    if (!attachment) return

    // Set deleting state for this attachment
    setDeletingStates((prev) => ({ ...prev, [index]: true }))

    try {
      const result = await deleteFromDrive(attachment.fileId)
      if (result.success) {
        setAttachments((prev) => prev.filter((_, i) => i !== index))
      } else {
        console.error("Error deleting file:", result.error)
        // Optionally show an error message to the user
      }
    } catch (error) {
      console.error("Error deleting file:", error)
      // Optionally show an error message to the user
    } finally {
      // Clear deleting state
      setDeletingStates((prev) => ({ ...prev, [index]: false }))
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const memoizedModules = useMemo(() => modules, [])

  return (
    <div
      className={cn(
        "fixed bottom-0 right-24 z-50 flex flex-col rounded-t-lg border bg-background shadow-2xl transition-all duration-200 bg-white",
        isMaximized ? "h-[90vh] w-[50vw]" : "w-[510px]",
        minimized ? "h-[48px]" : "h-[600px]",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h3 className="text-sm font-semibold">New Message</h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onMinimize}>
            <Minus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleMaximize}>
            {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {!minimized && (
        <>
          <div className="overflow-y-auto custom-scrollbar">

            <div className="flex flex-col border-b ">
              <EmailInput selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                className="border-none outline-none rounded-none focus-visible:ring-0"
              />
            </div>

            <div className="flex-1 flex flex-col custom-scrollbar">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                className="flex-1 h-fit min-h-[400px]"
                modules={memoizedModules}
              />
            </div>
          </div>

          {/* Attachments Section */}
          {attachments.length > 0 && (
            <>
              <div className="text-sm font-medium text-gray-500">Attachments</div>
              <div className="border-t p-2 space-y-2 max-h-20 overflow-y-auto">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <Paperclip className="h-4 w-4 text-gray-400" />
                      <span className="truncate max-w-[200px]">{file.filename}</span>
                      {file.size && <span className="text-gray-400">({formatBytes(file.size)})</span>}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6"
                      onClick={() => removeAttachment(index)}
                      disabled={deletingStates[index]}
                    >
                      {deletingStates[index] ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="flex items-center justify-between border-t p-2">
            <div className="flex items-center gap-2">
              <Button onClick={handleSendEmail} type="submit" className="gap-2 " disabled={sendDisable || isSending}>
                <Send className="h-4 w-4" />
                {isSending ? "Sending..." : "Send Email"}
              </Button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" />
              <Button variant="ghost" size="icon" onClick={handleFileSelect} disabled={uploading || isSending}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

