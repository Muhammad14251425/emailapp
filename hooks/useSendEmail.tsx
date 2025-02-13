'use client'
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

type EmailContextType = {

};


const EmailContext = createContext<EmailContextType | undefined>(undefined);


export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {



    return (
        <EmailContext.Provider value={{}}>
            {children}
        </EmailContext.Provider>
    );
};


export const useEmail = (): EmailContextType => {
    const context = useContext(EmailContext);
    if (!context) {
        throw new Error("useEmail must be used within a UserProvider");
    }
    return context;
};