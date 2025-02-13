"use server";

import dbConnect from "@/lib/dbConnect";
import Email from "@/models/Email"; // Make sure to import your User model

export async function getUsers() {
    await dbConnect();
    try {
        const users = await Email.find({});
        return JSON.parse(JSON.stringify(users));
    } catch (error) {
        console.error("Failed to fetch users:", error);
        throw new Error("Failed to fetch users");
    }
}

export async function createUser(formData: FormData) {
    await dbConnect();
    try {
        const title = formData.get("title") as string;
        const emails = formData.getAll("email") as string[]; // Handle array input
        const subject = formData.get("subject") as string;
        const body = formData.get("body") as string;

        if (!title || emails.length === 0 || !subject || !body) {
            throw new Error("Title, emails, subject, and body are required");
        }

        const newUser = new Email({ title, email: emails, subject, body });
        await newUser.save();
        return JSON.parse(JSON.stringify(newUser));
    } catch (error) {
        console.error("Failed to create user:", error);
        throw new Error("Failed to create user");
    }
}
