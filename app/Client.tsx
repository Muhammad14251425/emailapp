// "use client";

// import { useRef } from "react";

// import { useRouter } from "next/navigation";
// import { createUser } from "@/lib/actions";

// export default function UserForm() {
//   const formRef = useRef<HTMLFormElement>(null);
//   const router = useRouter();

//   async function handleSubmit(formData: FormData) {
//     await createUser(formData);
//     formRef.current?.reset();
//     router.refresh();
//   }

//   return (
//     <form ref={formRef} action={handleSubmit} className="space-y-4 max-w-4xl mx-auto">
//       {/* Title */}
//       <div>
//         <label htmlFor="title" className="block text-sm font-medium text-gray-700">
//           Title
//         </label>
//         <input
//           type="text"
//           id="title"
//           name="title"
//           required
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//         />
//       </div>

//       {/* Email (Supports multiple emails) */}
//       <div>
//         <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//           Email (Add multiple, separated by commas)
//         </label>
//         <input
//           type="text"
//           id="email"
//           name="email"
//           required
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//         />
//       </div>

//       {/* Subject */}
//       <div>
//         <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
//           Subject
//         </label>
//         <input
//           type="text"
//           id="subject"
//           name="subject"
//           required
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//         />
//       </div>

//       {/* Body */}
//       <div>
//         <label htmlFor="body" className="block text-sm font-medium text-gray-700">
//           Body
//         </label>
//         <textarea
//           id="body"
//           name="body"
//           required
//           rows={4}
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//         />
//       </div>

//       {/* Submit Button */}
//       <button
//         type="submit"
//         className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//       >
//         Add User
//       </button>
//     </form>
//   );
// }



"use client"

import { useEffect, useRef, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { EmailList } from "@/components/email-list"
import { EmailView } from "@/components/email-view"
import { ComposeWindow } from "@/components/compose-window"
import { VerificationPage } from "@/components/verification-page"
import { verifyOTP } from "@/lib/security"
import { useUser } from "@/hooks/userContext"
import Group from "@/components/group/Group"
import UserList from "@/components/user/UserList"
import { User } from "@/types/User"

const mockEmails = [
    {
        id: "1",
        subject: "Weekly Team Update",
        sender: "Sarah Johnson",
        senderEmail: "sarah.j@company.com",
        content: `
      <p>Hi team,</p>
      <p>Here's a summary of what we accomplished this week:</p>
      <ul>
        <li>Completed the initial design review</li>
        <li>Set up the development environment</li>
        <li>Started working on the core features</li>
      </ul>
      <p>Great work everyone!</p>
      <p>Best regards,<br>Sarah</p>
    `,
        date: new Date("2024-02-10T10:00:00"),
        unread: true,
        labels: ["Team", "Important"],
    },
    {
        id: "2",
        subject: "Project Deadline Reminder",
        sender: "Project Management",
        senderEmail: "pm@company.com",
        content: `
      <p>Hello,</p>
      <p>This is a reminder that the project deadline is approaching. Please ensure all deliverables are submitted by the end of the week.</p>
      <p>If you have any questions or concerns, don't hesitate to reach out.</p>
      <p>Regards,<br>Project Management Team</p>
    `,
        date: new Date("2024-02-09T15:30:00"),
        labels: ["Work"],
    },
]

interface ComposeWindowState {
    isOpen: boolean
    isMinimized: boolean
}


interface ClientProps {
    userList: User[]
}
export default function Client({ userList }: ClientProps) {
    const [makeGroup, setMakeGroup] = useState(false);
    const [users, setUsers] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [selectedEmail, setSelectedEmail] = useState<string>()
    const [composeWindow, setComposeWindow] = useState<ComposeWindowState>({
        isOpen: false,
        isMinimized: false,
    })
    const makeGroupRef = useRef<HTMLDivElement>(null)

    const {
        isVerified,
        isVerifying,
        verificationError,
        handleVerify,
        setIsVerified
    } = useUser();

    useEffect(() => {
        // Check if the user is already verified
        const storedVerificationState = localStorage.getItem("isVerified")
        if (storedVerificationState === "true") {
            setIsVerified(true)
        }

        // Set up event listener for when the page is about to be unloaded (tab closed)
        const handleBeforeUnload = () => {
            localStorage.removeItem("isVerified")
        }

        window.addEventListener("beforeunload", handleBeforeUnload)

        // Clean up the event listener
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload)
        }
    }, [])


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                makeGroup &&
                makeGroupRef.current &&
                !makeGroupRef.current.contains(event.target as Node)
            ) {
                setMakeGroup(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [makeGroup])

    if (!isVerified) {
        return <VerificationPage onVerify={handleVerify} isLoading={isVerifying} error={verificationError} />
    }

    const handleMakeGroup = () => {
        setMakeGroup(true)
    }
    const handleUsers = () => {
        setUsers(true)
    }

    const handleCompose = () => {
        setComposeWindow({ isOpen: true, isMinimized: false })
    }

    const handleCloseCompose = () => {
        setComposeWindow({ isOpen: false, isMinimized: false })
    }

    const handleMinimize = () => {
        setComposeWindow((prev) => ({ ...prev, isMinimized: !prev.isMinimized }))
    }

    const selectedEmailData = mockEmails.find((email) => email.id === selectedEmail)

    return (
        <>
            <div className="grid h-screen relative" style={{ gridTemplateColumns: "280px minmax(0, 1fr) minmax(0, 1fr)" }}>
                <Sidebar onCompose={handleCompose} onGroup={handleMakeGroup} onUsers={handleUsers} />
                <div className="border-l border-r overflow-hidden">
                    <EmailList emails={mockEmails} selectedEmail={selectedEmail} onSelectEmail={setSelectedEmail} />
                </div>
                <div className="overflow-auto">
                    <EmailView email={selectedEmailData} />
                </div>
                {makeGroup && (
                    <div className="absolute left-0 right-0 mx-auto max-w-[500px]">
                        <Group userList={userList} makeGroupRef={makeGroupRef} />
                    </div>
                )}
                {users && (
                    <div className="absolute left-0 right-0 mx-auto max-w-[500px]">
                        <UserList
                            setUsersDialog={setUsers}
                            initialUsers={userList}
                            editingUser={editingUser}
                            setEditingUser={setEditingUser}
                        />
                    </div>
                )}

            </div>

            {/* Compose Windows */}
            <div className="fixed bottom-0 right-0 flex items-end gap-4 p-4 z-50 bg-white">
                {composeWindow.isOpen && (
                    <div className="fixed bottom-0 right-0 p-4">
                        <ComposeWindow
                            minimized={composeWindow.isMinimized}
                            onClose={handleCloseCompose}
                            onMinimize={handleMinimize}
                        />
                    </div>
                )}
            </div>
        </>
    )
}


