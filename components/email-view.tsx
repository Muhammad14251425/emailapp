// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Badge } from "@/components/ui/badge"
// import { formatDistanceToNow } from "date-fns"
// import { Reply, Forward, MoreVertical, Star, Archive, Trash } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// interface EmailViewProps {
//   email: {
//     id: string
//     subject: string
//     sender: string
//     senderEmail?: string
//     content: string
//     date: Date
//     labels?: string[]
//   } | undefined
// }

// export function EmailView({ email }: EmailViewProps) {
//   if (!email) {
//     return (
//       <div className="flex h-full items-center justify-center">
//         <p className="text-muted-foreground -z-20">Select an email to view</p>
//       </div>
//     )
//   }

//   return (
//     <div className="flex h-full flex-col">
//       {/* Email Header */}
//       <div className="flex flex-col gap-4 border-b p-4">
//         <div className="flex items-start justify-between">
//           <div className="flex gap-4">
//             <Avatar>
//               <AvatarImage alt={email.sender} />
//               <AvatarFallback>{email.sender[0]}</AvatarFallback>
//             </Avatar>
//             <div>
//               <h2 className="text-xl font-semibold">{email.subject}</h2>
//               <div className="flex items-center gap-2">
//                 <span className="text-sm font-medium">{email.sender}</span>
//                 {email.senderEmail && (
//                   <span className="text-sm text-muted-foreground">&lt;{email.senderEmail}&gt;</span>
//                 )}
//               </div>
//               {email.labels && email.labels?.length > 0 && (
//                 <div className="mt-1 flex gap-2">
//                   {email.labels.map((label) => (
//                     <Badge key={label} variant="secondary">
//                       {label}
//                     </Badge>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//           <div className="flex items-center gap-2 text-muted-foreground">
//             <time>{formatDistanceToNow(email.date, { addSuffix: true })}</time>
//             <Button variant="ghost" size="icon">
//               <Star className="h-4 w-4" />
//             </Button>
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" size="icon">
//                   <MoreVertical className="h-4 w-4" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end">
//                 <DropdownMenuItem>
//                   <Archive className="mr-2 h-4 w-4" /> Archive
//                 </DropdownMenuItem>
//                 <DropdownMenuItem className="text-destructive">
//                   <Trash className="mr-2 h-4 w-4" /> Delete
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         </div>
//       </div>

//       {/* Email Content */}
//       <div className="flex-1 overflow-auto p-4">
//         <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: email.content }} />
//       </div>

//       {/* Email Actions */}
//       <div className="border-t p-4">
//         <div className="flex gap-2">
//           <Button variant="secondary" className="gap-2">
//             <Reply className="h-4 w-4" /> Reply
//           </Button>
//           <Button variant="secondary" className="gap-2">
//             <Forward className="h-4 w-4" /> Forward
//           </Button>
//         </div>
//       </div>
//     </div>
//   )
// }

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { Reply, Forward, MoreVertical, Star, Archive, Trash, Send, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { EmailType } from "@/types/Email"
import EmailRecipients from "./email-recipients"
import { getOriginalGoogleLink } from "@/lib/helper"

interface EmailViewProps {
  email: EmailType | undefined
  onResend: (id: string) => void
}

export function EmailView({ email, onResend }: EmailViewProps) {
  if (!email) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Select an email to view</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Email Header */}
      <div className="flex flex-col gap-4 border-b p-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <Avatar>
              <AvatarImage alt={email.recipients[0]} />
              <AvatarFallback>{email.recipients[0][0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{email.subject}</h2>
              <EmailRecipients recipients={email.recipients} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground mt-4 sm:mt-0 text-xs">
            <time>{formatDistanceToNow(new Date(email.createdAt), { addSuffix: true })}</time>
            <Button variant="ghost" size="icon">
              <Star className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Archive className="mr-2 h-4 w-4" /> Archive
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Email Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: email.body }} />
        </div>
      </ScrollArea>

      {/* Attachments */}
      {email.attachments && email.attachments.length > 0 && (
        <div className="border-t p-4">
          <h3 className="text-sm font-semibold mb-2">Attachments</h3>
          <div className="flex flex-wrap gap-2">
            {email.attachments.map((attachment, index) => (
              <a
                target="_blank"
                rel="noopener noreferrer"
                key={index} 
                href={attachment.path && getOriginalGoogleLink(attachment.path) || ""}
                >
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Paperclip className="h-3 w-3" />
                  {attachment.filename || `Attachment ${index + 1}`}
                </Badge>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Email Actions */}
      <div className="border-t p-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" className="gap-2">
            <Forward className="h-4 w-4" /> Forward
          </Button>
          {email.status === "failed" && (
            <Button variant="destructive" className="gap-2" onClick={() => onResend(email.id)}>
              <Send className="h-4 w-4" /> Resend
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

