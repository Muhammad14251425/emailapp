import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Archive, Clock, Edit, Inbox, Send, Star, Trash } from "lucide-react"
import type React from "react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    onCompose?: () => void
    onGroup?: () => void
    onUsers?: () => void
}

export function Sidebar({ className, onCompose, onGroup, onUsers }: SidebarProps) {
    const navigation = [
        { icon: Inbox, label: "Inbox", count: 12, href: "/" },
        { icon: Star, label: "Starred" },
        { icon: Clock, label: "Snoozed", href: '/a' },
        { icon: Send, label: "Sent" },
        { icon: Archive, label: "Archive" },
        { icon: Trash, label: "Trash" },
    ]

    return (
        <div className={cn("pb-12 min-h-screen", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 space-y-3">
                    <Button className="w-full justify-start gap-2" size="lg" onClick={onCompose}>
                        <Edit className="h-4 w-4" />
                        Compose
                    </Button>
                    <Button className="w-full justify-start gap-2 rounded-full bg-gray-100" variant={"ghost"} size="lg" onClick={onGroup}>
                        <Edit className="h-4 w-4" />
                        Make a group
                    </Button>
                    <Button className="w-full justify-start gap-2 rounded-full bg-gray-100" variant={"ghost"} size="lg" onClick={onUsers} >
                        <Edit className="h-4 w-4" />
                        View Users
                    </Button>
                </div>



                {/* <div className="px-3 py-2">
                    <div className="space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href || "/"}
                            >
                                <Button
                                    variant={item.label === "Inbox" ? "secondary" : "ghost"}
                                    className="w-full justify-start gap-2"
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                    {item.count && <span className="ml-auto text-xs text-muted-foreground">{item.count}</span>}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div> */}
            </div>
        </div>
    )
}

