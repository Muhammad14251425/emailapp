'use client'
import { verifyOTP } from "@/lib/security";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

type UserContextType = {
    handleVerify: (code: string) => Promise<void>
    setIsVerified: React.Dispatch<React.SetStateAction<boolean>>
    isVerified: boolean
    isVerifying: boolean
    verificationError: string | undefined
};


const UserContext = createContext<UserContextType | undefined>(undefined);


export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isVerified, setIsVerified] = useState(false)
    const [isVerifying, setIsVerifying] = useState(false)
    const [verificationError, setVerificationError] = useState<string>()

    useEffect(() => {
        // Check if the user is already verified
        const storedVerificationState = localStorage.getItem("isVerified")
        if (storedVerificationState === "true") {
          setIsVerified(true)
        }
    
        // Remove `isVerified` only when the tab is fully closed or refreshed
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
          localStorage.removeItem("isVerified")
        }
    
        // Add the event listener
        window.addEventListener("beforeunload", handleBeforeUnload)
    
        return () => {
          window.removeEventListener("beforeunload", handleBeforeUnload)
        }
      }, [setIsVerified])

    const handleVerify = async (code: string) => {
        setIsVerifying(true)
        setVerificationError(undefined)

        try {
            await verifyOTP(code)
            setIsVerified(true)
            localStorage.setItem("isVerified", "true")
        } catch (error) {
            setVerificationError(error instanceof Error ? error.message : "Verification failed")
        } finally {
            setIsVerifying(false)
        }
    }


    return (
        <UserContext.Provider value={{ isVerified, handleVerify, isVerifying, verificationError, setIsVerified }}>
            {children}
        </UserContext.Provider>
    );
};


export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};