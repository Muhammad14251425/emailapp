import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { Reply, Forward, MoreVertical, Star, Archive, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface EmailViewProps {
  email: {
    id: string
    subject: string
    sender: string
    senderEmail?: string
    content: string
    date: Date
    labels?: string[]
  } | undefined
}

export function EmailView({ email }: EmailViewProps) {
  if (!email) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground -z-20">Select an email to view</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Email Header */}
      <div className="flex flex-col gap-4 border-b p-4">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <Avatar>
              <AvatarImage alt={email.sender} />
              <AvatarFallback>{email.sender[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{email.subject}</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{email.sender}</span>
                {email.senderEmail && (
                  <span className="text-sm text-muted-foreground">&lt;{email.senderEmail}&gt;</span>
                )}
              </div>
              {email.labels && email.labels?.length > 0 && (
                <div className="mt-1 flex gap-2">
                  {email.labels.map((label) => (
                    <Badge key={label} variant="secondary">
                      {label}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <time>{formatDistanceToNow(email.date, { addSuffix: true })}</time>
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
      <div className="flex-1 overflow-auto p-4">
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: email.content }} />
      </div>

      {/* Email Actions */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Button variant="secondary" className="gap-2">
            <Reply className="h-4 w-4" /> Reply
          </Button>
          <Button variant="secondary" className="gap-2">
            <Forward className="h-4 w-4" /> Forward
          </Button>
        </div>
      </div>
    </div>
  )
}

