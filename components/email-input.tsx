"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { X } from "lucide-react"
import { getSuggestions, addNewEmail } from "@/lib/email-actions"

const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout
    return (...args: any[]) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => func(...args), delay)
    }
}

export interface EmailTag {
    email: string
    label: string
}

interface EmailSuggestion {
    type: "email" | "group" | "new"
    value: string
    label: string
    emails?: string[]
}

interface EmailInputProps {
    selectedTags: EmailTag[]
    setSelectedTags: React.Dispatch<React.SetStateAction<EmailTag[]>>
}

export default function EmailInput({ selectedTags, setSelectedTags }: EmailInputProps) {
    const [inputValue, setInputValue] = useState("")
    const [suggestions, setSuggestions] = useState<EmailSuggestion[]>([])
    const [error, setError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const debouncedFetchSuggestions = useRef(
        debounce(async (value: string, selectedItems: string[]) => {
            if (value) {
                try {
                    const results = await getSuggestions(value, selectedItems)
                    setSuggestions(Array.isArray(results) ? results : [])
                    setError(null)
                } catch (err) {
                    console.error("Error fetching suggestions:", err)
                    setSuggestions([])
                    setError("Failed to fetch suggestions")
                }
            } else {
                setSuggestions([])
            }
        }, 300),
    ).current

    useEffect(() => {
        const selectedItems = selectedTags.map((tag) => tag.email)
        debouncedFetchSuggestions(inputValue, selectedItems)
    }, [inputValue, selectedTags, debouncedFetchSuggestions]) // Added debouncedFetchSuggestions to dependencies

    const handleSelect = async (suggestion: EmailSuggestion) => {
        try {
            if (suggestion.type === "group") {
                const newEmails = suggestion.emails?.filter((email) => !selectedTags.some((tag) => tag.email === email)) || []
                const newTags = newEmails.map((email) => ({
                    email,
                    label: email,
                }))
                setSelectedTags([...selectedTags, ...newTags])
            } else {
                if (!selectedTags.some((tag) => tag.email === suggestion.value)) {
                    if (suggestion.type === "new") {
                        const result = await addNewEmail(suggestion.value)
                        if (!result.success) {
                            throw new Error(result.error)
                        }
                    }
                    setSelectedTags([
                        ...selectedTags,
                        {
                            email: suggestion.value,
                            label: suggestion.label,
                        },
                    ])
                }
            }
            setInputValue("")
            setError(null)
        } catch (err) {
            console.error("Error handling selection:", err)
            setError("Failed to add email")
        }
        inputRef.current?.focus()
    }

    const removeTag = (email: string) => {
        setSelectedTags(selectedTags.filter((tag) => tag.email !== email))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !inputValue && selectedTags.length > 0) {
            const lastTag = selectedTags[selectedTags.length - 1]
            removeTag(lastTag.email)
        }
    }

    const handleContainerClick = () => {
        inputRef.current?.focus()
    }

    return (
        <div className="relative w-full">
            <div
                ref={containerRef}
                onClick={handleContainerClick}
                className="flex flex-wrap gap-2 p-2 border min-h-[42px] cursor-text"
            >

                {selectedTags.map((tag) => (
                    <div
                        key={tag.email}
                        className="flex items-center gap-1 px-2 py-1 text-sm border rounded-full border-red-500 bg-white"
                    >
                        <span>{tag.label}</span>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                removeTag(tag.email)
                            }}
                            className="p-0.5 hover:bg-red-100 rounded-full"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
                <div className="flex-1 min-w-[120px]">
                    <input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value)
                        }}
                        onKeyDown={handleKeyDown}
                        className="w-full outline-none rounded-none focus-visible:ring-0 bg-transparent"
                        placeholder={selectedTags.length === 0 ? "Recipients" : ""}
                    />
                    {suggestions.length > 0 && (
                        <ul className="absolute left-0 right-0 z-10 mt-1 bg-white border rounded-md shadow-lg">
                            {suggestions.map((suggestion) => (
                                <li
                                    key={suggestion.value}
                                    onClick={() => handleSelect(suggestion)}
                                    className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                                >
                                    <span>
                                        {suggestion.type === "group" && "👥 "}
                                        {suggestion.type === "new" && "✨ "}
                                        {suggestion.label}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
            {/* {selectedTags.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Selected Emails:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            {selectedTags.map((tag) => (
              <li key={tag.email}>{tag.email}</li>
            ))}
          </ul>
        </div>
      )} */}
        </div>
    )
}