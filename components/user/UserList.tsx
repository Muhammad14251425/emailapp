"use client"

import { Dispatch, RefObject, SetStateAction, useState, useTransition } from "react"
import type { User } from "@/types/User"
import UserCard from "@/components/user/UserCard"
import UserForm from "@/components/user/UserForm"
import { Button } from "@/components/ui/button"
import { fetchUsers } from "@/lib/userActions"
import { X } from "lucide-react"

interface UserListProps {
  editingUser: User | null
  setEditingUser: Dispatch<SetStateAction<User | null>>
  initialUsers: User[]
  setUsersDialog: Dispatch<SetStateAction<boolean>>
}

export default function UserList({ initialUsers, setEditingUser, editingUser, setUsersDialog }: UserListProps) {
  const [users, setUsers] = useState(initialUsers)
  const [isAdding, setIsAdding] = useState(false)
  const [isPending, startTransition] = useTransition()

  const refreshUsers = () => {
    startTransition(async () => {
      const latestUsers = await fetchUsers()
      setUsers(latestUsers)
    })
  }

  const handleAddUser = (newUser: User) => {
    setUsers((prevUsers) => [newUser, ...prevUsers])
    setIsAdding(false)
    refreshUsers()
  }

  const handleUpdateUser = (updatedUser: User) => {
    setUsers((prevUsers) => prevUsers.map((user) => (user._id === updatedUser._id ? updatedUser : user)))
    setEditingUser(null)
    refreshUsers()
  }

  const handleDeleteUser = (deletedUserId: string) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user._id !== deletedUserId))
    refreshUsers()
  }


  return (
    <div className="top-0 mt-4 my-auto h-fit w-full min-w-2xl mx-auto p-6 border rounded-lg z-50 sticky left-0 right-0 bg-white shadow-2xl">
      <div className="relative">
        <X className="absolute -top-4 -right-4 border-2 rounded-lg cursor-pointer" onClick={() => setUsersDialog(false)} />
      </div>
      <div className="flex justify-between items-center mb-4 mt-3">
        <h2 className="text-xl font-semibold">User List</h2>
        {!isAdding && !editingUser && <Button onClick={() => setIsAdding(true)}>Add New User</Button>}
      </div>
      {isAdding && <UserForm onSubmit={handleAddUser} onCancel={() => { setIsAdding(false); setEditingUser(null) }} />}
      {editingUser && <UserForm user={editingUser} onSubmit={handleUpdateUser} onCancel={() => setEditingUser(null)} />}
      <div className="space-y-4 overflow-y-auto custom-scrollbar max-h-[40vh]">
        {users.map((user) => (
          <UserCard key={user._id} user={user} onEdit={() => setEditingUser(user)} onDelete={handleDeleteUser} />
        ))}
      </div>
      {isPending && <div className="mt-4 text-center">Updating...</div>}
    </div>
  )
}

