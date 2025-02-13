// "use client"
// import { RefObject, useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Checkbox } from "@/components/ui/checkbox"
// import { Label } from "@/components/ui/label"
// import { Search } from "lucide-react"

// interface User {
//   name: string
//   email: string
// }

// interface CreateGroupProps {
//   users: User[]
//   onCreateGroup: (data: { groupName: string; emails: string[] }) => void
//   makeGroupRef: RefObject<HTMLDivElement | null>
//   isCreating: boolean
// }

// export function CreateGroup({ users, onCreateGroup, makeGroupRef, isCreating }: CreateGroupProps) {
//   const [groupName, setGroupName] = useState("")
//   const [searchQuery, setSearchQuery] = useState("")
//   const [selectedEmails, setSelectedEmails] = useState<string[]>([])

//   const filteredUsers = users.filter(
//     (user) =>
//       user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       user.email.toLowerCase().includes(searchQuery.toLowerCase()),
//   )

//   const handleUserToggle = (email: string) => {
//     setSelectedEmails((prev) => (prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]))
//   }

//   const handleSubmit = () => {
//     if (groupName && selectedEmails.length > 0) {
//       onCreateGroup({
//         groupName,
//         emails: selectedEmails,
//       })
//       // Reset form after submission
//       setGroupName("")
//       setSelectedEmails([])
//     }
//   }

//   return (
//     <div ref={makeGroupRef} className="top-0 my-auto h-full w-full min-w-2xl max-h-[550px] mx-auto p-6 border rounded-lg z-50 sticky left-0 right-0 bg-white shadow-2xl">
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-xl font-semibold">Create Group</h2>
//         <Button onClick={handleSubmit} disabled={!groupName || selectedEmails.length < 2 || isCreating}>
//           {isCreating ? "Creating..." : "Add"}
//         </Button>
//       </div>

//       <div className="space-y-4">
//         <Input
//           placeholder="Enter group name"
//           value={groupName}
//           onChange={(e) => setGroupName(e.target.value)}
//           className="w-full border-2"
//         />

//         <div className="border rounded-lg p-4">
//           <div className="relative mb-4">
//             <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
//             <Input
//               placeholder="Search users by name or email"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-9"
//             />
//           </div>

//           <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
//             {filteredUsers.map((user) => (
//               <div key={user.email} className="flex items-center space-x-3 p-2 hover:bg-accent rounded-lg">
//                 <Checkbox
//                   id={user.email}
//                   checked={selectedEmails.includes(user.email)}
//                   onCheckedChange={() => handleUserToggle(user.email)}
//                   className="rounded-full"
//                 />
//                 <Label htmlFor={user.email} className="flex-1 cursor-pointer">
//                   <div className="font-medium">{user.name}</div>
//                   <div className="text-sm text-muted-foreground">{user.email}</div>
//                 </Label>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }



"use client"
import { type RefObject, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface User {
  name: string
  email: string
}

interface CreateGroupProps {
  users: User[]
  onCreateGroup: (data: { groupName: string; emails: string[] }) => void
  isCreating: boolean
  onCancel: () => void
  existingGroupNames: string[]
}

export function CreateGroup({
  users,
  onCreateGroup,
  isCreating,
  onCancel,
  existingGroupNames,
}: CreateGroupProps) {
  const [groupName, setGroupName] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [isGroupNameUnique, setIsGroupNameUnique] = useState(true)

  useEffect(() => {
    const trimmedGroupName = groupName.trim().toLowerCase()
    setIsGroupNameUnique(!existingGroupNames.includes(trimmedGroupName))
  }, [groupName, existingGroupNames])

  const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupName(e.target.value)
  }

  const handleUserSelect = (user: User) => {
    const isSelected = selectedUsers.some((u) => u.email === user.email)
    if (isSelected) {
      setSelectedUsers(selectedUsers.filter((u) => u.email !== user.email))
      setSelectedEmails(selectedEmails.filter((email) => email !== user.email))
    } else {
      setSelectedUsers([...selectedUsers, user])
      setSelectedEmails([...selectedEmails, user.email])
    }
  }

  const handleSubmit = () => {
    if (isGroupNameUnique) {
      onCreateGroup({ groupName, emails: selectedEmails })
    }
  }

  return (
    <div
      className="top-0 my-auto h-fit w-full min-w-2xl max-h-[550px] mx-auto p-6 border rounded-lg z-50 sticky left-0 right-0 bg-white shadow-2xl"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Create Group</h2>
        <div>
          <Button onClick={onCancel} variant="outline" className="mr-2">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!groupName || selectedEmails.length < 2 || isCreating || !isGroupNameUnique}
          >
            {isCreating ? "Creating..." : "Add"}
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <Label htmlFor="group-name">Group Name</Label>
          <Input
            id="group-name"
            type="text"
            placeholder="Enter group name"
            value={groupName}
            onChange={handleGroupNameChange}
            className={!isGroupNameUnique ? "border-red-500" : ""}
          />
          {!isGroupNameUnique && (
            <p className="text-red-500 text-sm mt-1">This group name already exists. Please choose a different name.</p>
          )}
        </div>
        <div>
          <Label>Select Users</Label>
          <div className="mt-2 space-y-3 max-h-[250px] overflow-y-auto">
            {users.map((user) => (
              <div key={user.email} className="flex items-center">
                <Checkbox
                  id={user.email}
                  checked={selectedUsers.some((u) => u.email === user.email)}
                  onCheckedChange={() => handleUserSelect(user)}
                />
                <Label htmlFor={user.email} className="ml-2">
                  {user.name} ({user.email})
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

