"use client"

import { useState } from "react"
import type { User } from "@/types/User"
import { deleteUser } from "@/lib/userActions"
import { Button } from "@/components/ui/button"
import { MoreVertical, Edit, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface UserCardProps {
  user: User
  onEdit: () => void
  onDelete: (id: string) => void
}

export default function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteUser(user._id)
      onDelete(user._id)
    } catch (error) {
      console.error("Failed to delete user:", error)
    }
    setIsDeleting(false)
  }

  return (
    <div className="bg-white border rounded-lg p-4 flex justify-between items-center">
      <div>
        <h3 className="font-semibold">{user?.name}</h3>
        <p className="text-gray-600">{user?.email[0]}</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} disabled={isDeleting}>
            <Trash className="mr-2 h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

