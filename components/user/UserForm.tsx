"use client"

import { useState } from "react"
import type { User } from "@/types/User"
import { addUser, updateUser } from "@/lib/userActions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface UserFormProps {
  user?: User
  onSubmit: (user: User) => void
  onCancel: () => void
}

export default function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email[0] || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (user) {
        await updateUser(user._id, name, email)
        onSubmit({ ...user, name, email: [email] })
      } else {
        const newUser = await addUser(name, email)
        onSubmit(newUser)
      }
    } catch (error) {
      console.error("Failed to submit user:", error)
    }
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-4">
      <Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : user ? "Update" : "Add"}
        </Button>
      </div>
    </form>
  )
}

