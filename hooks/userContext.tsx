// "use client"

// import type React from "react"
// import { createContext, type ReactNode, useState, useEffect } from "react"
// import { verifyUser, createUser } from "@/actions/userActions"

// export type UserContextType = {
//   handleVerify: (code: string) => Promise<void>
//   setIsVerified: React.Dispatch<React.SetStateAction<boolean>>
//   isVerified: boolean
//   isVerifying: boolean
//   verificationError: string | undefined
// }

// export const UserContext = createContext<UserContextType | undefined>(undefined)

// export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [isVerified, setIsVerified] = useState(false)
//   const [isVerifying, setIsVerifying] = useState(false)
//   const [verificationError, setVerificationError] = useState<string>()

//   useEffect(() => {
//     const storedVerificationState = localStorage.getItem("isVerified")
//     if (storedVerificationState === "true") {
//       setIsVerified(true)
//     }

//     const handleBeforeUnload = () => {
//       localStorage.removeItem("isVerified")
//     }

//     window.addEventListener("beforeunload", handleBeforeUnload)

//     return () => {
//       window.removeEventListener("beforeunload", handleBeforeUnload)
//     }
//   }, [])

//   const handleVerify = async (code: string) => {
//     setIsVerifying(true)
//     setVerificationError(undefined)

//     try {
//       const storedOTP = localStorage.getItem("userOTP")

//       if (storedOTP) {
//         // If we have a stored OTP, try to verify it
//         const { accessToken, refreshToken } = await verifyUser(storedOTP)
//         setIsVerified(true)
//         localStorage.setItem("isVerified", "true")
//         // You might want to store these tokens securely, not in localStorage
//         console.log("Tokens:", accessToken, refreshToken)
//       } else {
//         // If we don't have a stored OTP, create a new user
//         const newUser = await createUser(code)
//         localStorage.setItem("userOTP", code)
//         localStorage.setItem("otpTimestamp", new Date().toISOString())
//         setIsVerified(true)
//         localStorage.setItem("isVerified", "true")
//       }
//     } catch (error) {
//       setVerificationError(error instanceof Error ? error.message : "Verification failed")
//       localStorage.removeItem("userOTP")
//       localStorage.removeItem("otpTimestamp")
//     } finally {
//       setIsVerifying(false)
//     }
//   }

//   return (
//     <UserContext.Provider value={{ isVerified, handleVerify, isVerifying, verificationError, setIsVerified }}>
//       {children}
//     </UserContext.Provider>
//   )
// }

