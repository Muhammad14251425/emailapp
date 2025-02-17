import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import dbConnect from "@/lib/dbConnect"
import Email from "@/models/Email"
import { revalidatePath } from "next/cache"

interface Attachment {
  filename: string
  path: string
}

interface EmailData {
  subject: string
  content: string
  recipients: string[]
  attachments?: Attachment[]
}

export async function POST(req: Request) {
  try {
    const { subject, content, recipients, attachments }: EmailData = await req.json()

    if (!subject || !content || !recipients || recipients.length === 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    // Connect to database
    await dbConnect()

    // Nodemailer transporter setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GOOGLE_USER_EMAIL,
        pass: process.env.GOOGLE_APP_PASSWORD, // Use App Passwords for security
      },
    })

    // Send email
    const info = await transporter.sendMail({
      from: process.env.GOOGLE_USER_EMAIL,
      bcc: recipients.join(", "),
      subject,
      html: content,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        path: attachment.path,
      })),
    })

    console.log("Email sent:", info.messageId)

    // Save email in database
    const emailStatus = info.messageId ? "SENT" : "FAILED"
    await Email.create({
      recipients,
      subject,
      body: content,
      status: emailStatus,
      attachments,
    })

    // Revalidate cache
    revalidatePath("/")

    return NextResponse.json({ success: true, messageId: info.messageId })
  } catch (error) {
    console.error("Email sending failed:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
