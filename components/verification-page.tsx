import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OTPInput } from "./otp-input"
import { Shield } from "lucide-react"

interface VerificationPageProps {
  onVerify: (code: string) => Promise<void>
  isLoading: boolean
  error?: string
}

export function VerificationPage({ onVerify, isLoading, error }: VerificationPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-[380px]">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle>Verification Required</CardTitle>
          <CardDescription>Please enter the 6-digit security code to access the application</CardDescription>
        </CardHeader>
        <CardContent>
          <OTPInput onComplete={onVerify} isLoading={isLoading} error={error} />
        </CardContent>
      </Card>
    </div>
  )
}

