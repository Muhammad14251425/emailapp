"use server"

import { revalidatePath } from "next/cache"
import User from "../models/User"
import dbConnect from "./dbConnect"

// Ensure database connection

export async function fetchUsers() {
    await dbConnect()
    const users = await User.find({}).sort({ createdAt: -1 }).lean().exec();
    const formattedUsers = users.map(user => ({
        _id: user._id!.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
    }));

    return formattedUsers
}

export async function addUser(name: string, email: string) {
    await dbConnect()
    const newUser = new User({ name, email: [email] })
    await newUser.save()
    revalidatePath("/")
    return {
        _id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
    }
}

export async function updateUser(id: string, name: string, email: string) {
    await dbConnect()
    await User.findByIdAndUpdate(id, { name, email: [email] })
    revalidatePath("/")
}

export async function deleteUser(id: string) {
    await dbConnect()
    await User.findByIdAndDelete(id)
    revalidatePath("/")
}

