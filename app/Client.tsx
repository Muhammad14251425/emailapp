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
import Group, { GroupType } from "@/components/group/Group"
import UserList from "@/components/user/UserList"
import { User } from "@/types/User"
import { EmailType } from "@/types/Email"
import { resendEmail, sendEmail } from "@/lib/sendEmail"
import { toast } from "@/hooks/use-toast"



interface ComposeWindowState {
    isOpen: boolean
    isMinimized: boolean
}


interface ClientProps {
    userList: User[]
    emails: EmailType[]
    groups: GroupType[]
}
export default function Client({ userList, emails, groups }: ClientProps) {
    const [makeGroup, setMakeGroup] = useState(false);
    const [users, setUsers] = useState(false);
    const [sending, setIsSending] = useState(false);
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

    // if (!isVerified) {
    //     return <VerificationPage onVerify={handleVerify} isLoading={isVerifying} error={verificationError} />
    // }

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

    const onResend = async (email: EmailType) => {
        setIsSending(true);
        try {
            const result = await resendEmail(email)

            if (result.success) {
                toast({
                    title: "Success",
                    description: `Email sent to ${result.recipients!.join(", ")}`,
                })
            }
            else if (result.authUrl) {
                // If we need authentication, redirect to the auth URL
                window.location.href = result.authUrl
            }
            else {
                throw new Error(result.message)
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to reSend email",
                variant: "destructive",
            })
        } finally {
            setIsSending(false)
        }
    }

    const selectedEmailData = emails.find((email) => email.id === selectedEmail)

    return (
        <>
            <div className="grid h-screen relative" style={{ gridTemplateColumns: "280px minmax(0, 1fr) minmax(0, 1fr)" }}>
                <Sidebar onCompose={handleCompose} onGroup={handleMakeGroup} onUsers={handleUsers} />
                <div className="border-l border-r overflow-hidden">
                    <EmailList emails={emails} selectedEmail={selectedEmail} onSelectEmail={setSelectedEmail} />
                </div>
                <div className="overflow-auto">
                    <EmailView email={selectedEmailData} onResend={onResend} sending={sending} />
                </div>
                {makeGroup && (
                    <div className="absolute left-0 right-0 mx-auto max-w-[500px]">
                        <Group userList={userList} makeGroupRef={makeGroupRef} groups={groups} />
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


