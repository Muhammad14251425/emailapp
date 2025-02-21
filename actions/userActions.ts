// "use server"

// import { revalidatePath } from "next/cache"
// import UserDetails from "@/models/userDetails"
// import dbConnect from "@/lib/dbConnect" // Assume this function exists to connect to your MongoDB

// export async function verifyUser(otp: string) {
//     await dbConnect()
  
//     const user = await UserDetails.findOne({ password: otp })
  
//     if (!user) {
//       throw new Error("Invalid OTP")
//     }
  
//     // Check if the OTP is older than 4 days
//     const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
//     if (user.createdAt < fourDaysAgo) {
//       await UserDetails.deleteOne({ _id: user._id })
//       throw new Error("OTP expired. Please request a new one.")
//     }
  
//     // Generate new tokens
//     const accessToken = Math.random().toString(36).substring(2)
//     const refreshToken = Math.random().toString(36).substring(2)
  
//     // Update user with new tokens
//     user.accessToken = accessToken
//     user.refreshToken = refreshToken
//     user.authenticated = "authenticated"
//     await user.save()
  
//     revalidatePath("/dashboard") // Adjust this path as needed
  
//     return { accessToken, refreshToken }
//   }
  
//   export async function createUser(otp: string) {
//     await dbConnect()
  
//     const newUser = new UserDetails({
//       password: otp,
//       authenticated: "unauthenticated",
//     })
  
//     await newUser.save()
  
//     revalidatePath("/dashboard") // Adjust this path as needed
  
//     return newUser
//   }
  
  