"use server"

// This is a mock verification - replace with your actual database check
const VALID_CODE = "123456" // In reality, this should be stored securely in your database

export async function verifyOTP(code: string) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  if (code === VALID_CODE) {
    return { success: true }
  }

  throw new Error("Invalid verification code")
}

