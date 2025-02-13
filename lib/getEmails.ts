"use server";

import Email from "@/models/Email"; // Adjust the import path as needed
import dbConnect from "@/lib/dbConnect"; // Ensure this function is implemented correctly

interface Attachment {
    filename: string;
    path: string;
    _id: string;
}

export async function getEmails() {
    try {
        await dbConnect();

        const emails = await Email.find().sort({ createdAt: -1 }).lean();

        return emails.map((email) => ({
            id: email._id!.toString(),
            subject: email.subject as string,
            recipients: email.recipients as string[], // Keep all recipients instead of assuming the first is the sender
            body: email.body as string, // Renamed from `content` to match schema
            status: email.status as "send" | "failed",
            attachments: email.attachments.map((attachment: Attachment) => ({ filename: attachment.filename, path: attachment.path, _id: attachment._id!.toString() })) || [], // Ensure attachments are included
            createdAt: email.createdAt as Date, // Keep createdAt for reference
        }))
    } catch (error) {
        console.error("Failed to fetch emails:", error);
        return [];
    }
}
