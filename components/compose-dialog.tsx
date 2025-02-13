// "use client"

// import { useState } from "react"
// import dynamic from "next/dynamic"
// import { Button } from "@/components/ui/button"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import { Send } from "lucide-react"

// const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })

// interface ComposeDialogProps {
//   open: boolean
//   onOpenChange: (open: boolean) => void
// }

// export function ComposeDialog({ open, onOpenChange }: ComposeDialogProps) {
//   const [content, setContent] = useState("")

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[800px] z-50">
//         <DialogHeader className="z-50">
//           <DialogTitle>New Message</DialogTitle>
//         </DialogHeader>
//         <div className="grid gap-4">
//           <div className="grid gap-2">
//             <Input placeholder="To" />
//             <Input placeholder="Subject" />
//           </div>
//           <div className="min-h-[300px]">
//             <ReactQuill theme="snow" value={content} onChange={setContent} className="h-[250px]" />
//           </div>
//           <div className="flex justify-end">
//             <Button>
//               <Send className="mr-2 h-4 w-4" />
//               Send
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   )
// }

