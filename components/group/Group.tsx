"use client"

import { RefObject, useState } from "react";
import { CreateGroup } from "./create-group";
import { toast } from "@/hooks/use-toast"
import { createGroup } from "@/lib/createGroup";
import { User } from "@/types/User";


// Example users data - replace with your API call
const DUMMY_USERS = [
  { name: "John Doe", email: "john@example.com" },
  { name: "Jane Smith", email: "jane@example.com" },
  { name: "Alice Johnson", email: "alice@example.com" },
  { name: "Bob Wilson", email: "bob@example.com" },
  { name: "Carol Browns", email: "carol@example.com" },
]

interface Group {
  makeGroupRef: RefObject<HTMLDivElement | null>
  userList: User[]
}



const Group = ({ makeGroupRef, userList }: Group) => {
  console.log(userList)
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateGroup = async (data: { groupName: string; emails: string[] }) => {
    setIsCreating(true)
    try {
      const result = await createGroup(data)
      if (result.success) {
        toast({
          title: "Success",
          description: "Group created successfully",
        })
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create group",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const transformedUsers = userList.map(user => ({
    name: user.name,
    email: user.email[0], // Take the first email from the array
  }));

  return (
    <div className="p-4 ">
      <CreateGroup
        makeGroupRef={makeGroupRef}
        users={transformedUsers}
        onCreateGroup={handleCreateGroup}
        isCreating={isCreating}
      />
    </div>
  )
}

export default Group

