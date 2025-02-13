// import { formatDistanceToNow } from "date-fns"
// import { Badge } from "@/components/ui/badge"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { cn } from "@/lib/utils"

// interface Email {
//   id: string
//   subject: string
//   sender: string
//   date: Date
//   content: string
//   unread?: boolean
//   labels?: string[]
// }

// interface EmailListProps {
//   emails: Email[]
//   selectedEmail?: string
//   onSelectEmail: (id: string) => void
// }

// export function EmailList({ emails, selectedEmail, onSelectEmail }: EmailListProps) {
//   if (!emails.length) {
//     return (
//       <div className="flex h-full items-center justify-center">
//         <p className="text-muted-foreground">No emails found</p>
//       </div>
//     )
//   }

//   return (
//     <>
//       <h2 className="py-6 border-b px-4 font-semibold">Sent Mails</h2>
//       <ScrollArea className="h-screen">
//         <div className="flex flex-col">
//           {emails.map((email) => (
//             <button
//               key={email.id}
//               onClick={() => onSelectEmail(email.id)}
//               className={cn(
//                 "flex flex-col gap-1 border-b p-4 text-left transition-colors hover:bg-accent hover:bg-gray-100",
//                 selectedEmail === email.id && "bg-accent",
//                 email.unread && "font-medium",
//               )}
//             >
//               <div className="flex items-center justify-between gap-2">
//                 <span className="text-sm">{email.sender}</span>
//                 <span className="text-xs text-muted-foreground">
//                   {formatDistanceToNow(email.date, { addSuffix: true })}
//                 </span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-sm font-medium">{email.subject}</span>
//                 {email.labels?.map((label) => (
//                   <Badge key={label} variant="secondary" className="text-xs">
//                     {label}
//                   </Badge>
//                 ))}
//               </div>
//               <p
//                 className="text-xs text-muted-foreground line-clamp-2"
//                 dangerouslySetInnerHTML={{ __html: email.content }}
//               ></p>

//             </button>
//           ))}
//         </div>
//       </ScrollArea >
//     </>
//   )
// }

"use client"

import { formatDistanceToNow } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { EmailType } from "@/types/Email"

interface EmailListProps {
  selectedEmail?: string
  onSelectEmail: (id: string) => void
  emails: EmailType[]
}

export function EmailList({ emails, selectedEmail, onSelectEmail }: EmailListProps) {
  if (!emails.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No emails found</p>
      </div>
    )
  }

  return (
    <>
      <h2 className="py-6 border-b px-4 font-semibold">Sent Mails</h2>
      <ScrollArea className="h-screen">
        <div className="flex flex-col">
          {emails.map((email) => (
            <button
              key={email.id}
              onClick={() => onSelectEmail(email.id)}
              className={cn(
                "flex flex-col gap-1 border-b p-4 text-left transition-colors hover:bg-accent hover:bg-gray-100 relative",
                selectedEmail === email.id && "bg-accent",
              )}
            >
              {email.status === "failed" && <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />}
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm">{email.recipients[0]}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(email.createdAt), { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{email.subject}</span>
              </div>
              <p
                className="text-xs text-muted-foreground line-clamp-2"
                dangerouslySetInnerHTML={{ __html: email.body }}
              ></p>
              {email.attachments && email.attachments.length > 0 && (
                <div className="mt-1">
                  <span className="text-xs text-muted-foreground">
                    {email.attachments.length} attachment{email.attachments.length > 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </ScrollArea>
    </>
  )
}

