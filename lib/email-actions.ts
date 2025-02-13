"use server"

import User, { type IUser } from "../models/User"
import Group, { type IGroup } from "../models/Groups"
import dbConnect from "./dbConnect"

interface EmailSuggestion {
  type: "email" | "group" | "new"
  value: string
  label: string
  emails?: string[]
}

export async function getSuggestions(query: string, selectedItems: string[]): Promise<EmailSuggestion[]> {
  if (!query) return []

  try {
    const suggestions: EmailSuggestion[] = []
    await dbConnect()

    // Search for existing users
    const users = await User.find({
      email: {
        $regex: query,
        $options: "i",
        $nin: selectedItems,
      },
    })
      .limit(5)
      .exec()

    users.forEach((user: IUser) => {
      if (!selectedItems.includes(user.email[0])) {
        suggestions.push({
          type: "email",
          value: user.email[0],
          label: user.name || user.email[0],
        })
      }
    })

    // Search for groups
    const groups = await Group.find({
      name: {
        $regex: query,
        $options: "i",
        $nin: selectedItems,
      },
    })
      .limit(3)
      .exec()

    groups.forEach((group: IGroup) => {
      if (!selectedItems.includes(group.name)) {
        suggestions.push({
          type: "group",
          value: group.name,
          label: group.name,
          emails: group.emails,
        })
      }
    })

    // If query looks like an email and no exact match found
    if (query.includes("@") && !suggestions.some((s) => s.value === query) && !selectedItems.includes(query)) {
      suggestions.push({
        type: "new",
        value: query,
        label: `Add "${query}"`,
      })
    }
    
    return suggestions

  } catch (error) {
    console.error("Error fetching suggestions:", error)
    return []
  }
}

export async function addNewEmail(email: string) {
  try {
    const name = email.split("@")[0]
    await dbConnect()
    await User.create({
      email: [email],
      name,
    })
    return { success: true }
  } catch (error) {
    console.error("Error adding new email:", error)
    return { success: false, error: "Failed to add new email" }
  }
}

