// "use client"

// import { RefObject, useState } from "react";
// import { CreateGroup } from "./create-group";
// import { toast } from "@/hooks/use-toast"
// import { createGroup } from "@/lib/createGroup";
// import { User } from "@/types/User";



// interface Group {
//   makeGroupRef: RefObject<HTMLDivElement | null>
//   userList: User[]
// }



// const Group = ({ makeGroupRef, userList }: Group) => {
//   console.log(userList)
//   const [isCreating, setIsCreating] = useState(false);

//   const handleCreateGroup = async (data: { groupName: string; emails: string[] }) => {
//     setIsCreating(true)
//     try {
//       const result = await createGroup(data)
//       if (result.success) {
//         toast({
//           title: "Success",
//           description: "Group created successfully",
//         })
//       } else {
//         throw new Error(result.message)
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: error instanceof Error ? error.message : "Failed to create group",
//         variant: "destructive",
//       })
//     } finally {
//       setIsCreating(false)
//     }
//   }

//   const transformedUsers = userList.map(user => ({
//     name: user.name,
//     email: user.email[0], // Take the first email from the array
//   }));

//   return (
//     <div className="p-4 ">
//       <CreateGroup
//         makeGroupRef={makeGroupRef}
//         users={transformedUsers}
//         onCreateGroup={handleCreateGroup}
//         isCreating={isCreating}
//       />
//     </div>
//   )
// }

// export default Group

"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { createGroup } from "@/lib/createGroup"
import type { User } from "@/types/User"
import { type RefObject, useEffect, useState } from "react"
import { CreateGroup } from "./create-group"

export interface GroupType {
  id: string
  name: string
  emails: string[]
}

interface GroupProps {
  makeGroupRef: RefObject<HTMLDivElement | null>
  userList: User[]
  groups: GroupType[]
}

const Group = ({ makeGroupRef, userList, groups }: GroupProps) => {
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    if (!groups) {
      setIsCreating(true);
    }
  }, [groups])

  const handleCreateGroup = async (data: { groupName: string; emails: string[] }) => {
    setIsCreating(true)
    try {
      const result = await createGroup(data)
      if (result.success) {
        toast({
          title: "Success",
          description: "Group created successfully",
        })
        setShowCreateForm(false)
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

  const transformedUsers = userList.map((user) => ({
    name: user.name,
    email: user.email[0], // Take the first email from the array
  }))

  const existingGroupNames = groups.map(group => group.name.toLowerCase())

  return (
    <div ref={makeGroupRef} className="p-4 bg-white border mt-8 rounded-md">
      {!showCreateForm ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Existing Groups</h2>
            <Button onClick={() => setShowCreateForm(true)}>Make a Group</Button>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
            {groups.map((group) => (
              <div key={group.id} className="border p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">{group.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {group.emails.map((email) => (
                    <Badge key={email} variant="secondary">
                      {email}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Create New Group</h2>
            <Button onClick={() => setShowCreateForm(false)} variant="outline">
              Back to Groups
            </Button>
          </div>
          <CreateGroup
            users={transformedUsers}
            onCreateGroup={handleCreateGroup}
            isCreating={isCreating}
            onCancel={() => setShowCreateForm(false)}
            existingGroupNames={existingGroupNames}
          />
        </div>
      )}
    </div>
  )
}

export default Group

