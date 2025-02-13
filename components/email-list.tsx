import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Email {
  id: string
  subject: string
  sender: string
  date: Date
  content: string
  unread?: boolean
  labels?: string[]
}

interface EmailListProps {
  emails: Email[]
  selectedEmail?: string
  onSelectEmail: (id: string) => void
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
                "flex flex-col gap-1 border-b p-4 text-left transition-colors hover:bg-accent hover:bg-gray-100",
                selectedEmail === email.id && "bg-accent",
                email.unread && "font-medium",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm">{email.sender}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(email.date, { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{email.subject}</span>
                {email.labels?.map((label) => (
                  <Badge key={label} variant="secondary" className="text-xs">
                    {label}
                  </Badge>
                ))}
              </div>
              <p
                className="text-xs text-muted-foreground line-clamp-2"
                dangerouslySetInnerHTML={{ __html: email.content }}
              ></p>

            </button>
          ))}
        </div>
      </ScrollArea >
    </>
  )
}

