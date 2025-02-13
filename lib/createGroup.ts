"use server"

import { revalidatePath } from "next/cache"
import Group from "@/models/Groups" // Adjust the import path as necessary
import dbConnect from "@/lib/dbConnect" // Assume you have a database connection utility

export async function createGroup(groupData: { groupName: string; emails: string[] }) {
    if (groupData.emails.length < 2) {
        throw new Error("A group must have at least two members")
    }

    try {
        await dbConnect()
        const newGroup = new Group({
            name: groupData.groupName,
            priority: 1, // You might want to adjust how priority is set
            emails: groupData.emails,
        })

        await newGroup.save()
        revalidatePath("/groups") // Adjust the path as needed
        return { success: true, message: "Group created successfully" }
    } catch (error) {
        console.error("Error creating group:", error)
        return { success: false, message: "Failed to create group" }
    }
}