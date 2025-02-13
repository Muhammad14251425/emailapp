"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface OTPInputProps {
    length?: number
    onComplete: (code: string) => void
    isLoading?: boolean
    error?: string
}

export function OTPInput({ length = 6, onComplete, isLoading = false, error }: OTPInputProps) {
    const [code, setCode] = React.useState<string[]>(new Array(length).fill(""))
    const inputs = React.useRef<(HTMLInputElement | null)[]>([])

    const processInput = (e: React.ChangeEvent<HTMLInputElement>, slot: number) => {
        const num = e.target.value
        if (/[^0-9]/.test(num)) return
        const newCode = [...code]
        newCode[slot] = num
        setCode(newCode)
        if (slot !== length - 1) {
            inputs.current[slot + 1]?.focus()
        }
        if (newCode.every((num) => num !== "")) {
            onComplete(newCode.join(""))
        }
    }

    const onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>, slot: number) => {
        if (e.key === "Backspace" && !code[slot] && slot !== 0) {
            const newCode = [...code]
            newCode[slot - 1] = ""
            setCode(newCode)
            inputs.current[slot - 1]?.focus()
        }
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex gap-2">
                {code.map((num, idx) => (
                    <Input
                        key={idx}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={num}
                        autoFocus={!code[0].length && idx === 0}
                        onChange={(e) => processInput(e, idx)}
                        onKeyUp={(e) => onKeyUp(e, idx)}
                        ref={(input) => { (inputs.current[idx] = input) }}
                        className={cn("w-10 h-12 text-center text-2xl", error && "border-destructive")}
                        disabled={isLoading}
                    />
                ))}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
    )
}

