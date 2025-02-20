import { type NextRequest, NextResponse } from "next/server"
import { getGmailTransporter } from "@/lib/gmail"
import Email from "@/models/Email"
import dbConnect from "@/lib/dbConnect"
import type nodemailer from "nodemailer"

interface Attachment {
  filename?: string
  content?: string | Buffer
  path?: string
  contentType?: string
  encoding?: string
  headers?: Record<string, string>
  cid?: string
}

interface EmailData {
  subject: string
  content: string
  recipients: string[]
  attachments?: Attachment[]
}

const BATCH_SIZE = 100

async function sendBatch(transporter: nodemailer.Transporter, emailData: EmailData, batch: string[]) {
  try {
    // console.log("Attempting to send batch...")
    // console.log("From:", "3ulogisticwebsite@gmail.com")
    // console.log("To:", batch.join(", "))
    // console.log("Subject:", emailData.subject)

    await transporter.sendMail({
      from: "3ulogisticwebsite@gmail.com",
      bcc: batch.join(", "),
      subject: emailData.subject,
      html: emailData.content,
      attachments: emailData.attachments?.map((attachment) => ({
        filename: attachment.filename,
        path: attachment.path,
      })),
    })

    // console.log("Batch sent successfully. Message ID:", info.messageId)
    return { success: true, recipients: batch }
  } catch (error) {
    console.error("Failed to send batch:", error)
    if (error instanceof Error) {
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return { success: false, recipients: batch }
  }
}

export async function POST(request: NextRequest) {
  // console.log("API route called")
  await dbConnect()

  let emailData: EmailData
  let tokens: { access_token: string; refresh_token: string }

  try {
    const body = await request.json()
    emailData = body.emailData
    tokens = body.tokens
    // console.log("Received email data:", JSON.stringify(emailData, null, 2))
    // console.log("Received tokens:", JSON.stringify(tokens, null, 2))
  } catch (error) {
    console.error("Failed to parse request body:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request body",
        recipients: [],
      },
      { status: 400 },
    )
  }

  let transporter: nodemailer.Transporter
  try {
    transporter = await getGmailTransporter({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    })
    // console.log("Gmail transporter created successfully")
  } catch (error) {
    console.error("Failed to create Gmail transporter:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to initialize email service. Please try again later.",
        recipients: [],
      },
      { status: 500 },
    )
  }

  const { recipients, subject, content, attachments } = emailData
  const totalBatches = Math.ceil(recipients.length / BATCH_SIZE)
  const sentRecipients: string[] = []
  let emailStatus: "send" | "failed" = "send"

  try {
    for (let i = 0; i < totalBatches; i++) {
      const start = i * BATCH_SIZE
      const end = start + BATCH_SIZE
      const batch = recipients.slice(start, end)

      // console.log(`Sending batch ${i + 1} of ${totalBatches}`)
      const batchResult = await sendBatch(transporter, emailData, batch)

      if (batchResult.success) {
        sentRecipients.push(...batchResult.recipients)
        // console.log(`Successfully sent to ${batchResult.recipients.length} recipients`)
      } else {
        console.error(`Failed to send batch ${i + 1}`)
        emailStatus = "failed"
        break
      }

      if (i < totalBatches - 1) {
        // console.log("Waiting before sending next batch...")
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    // console.log(`Email ${emailStatus} to ${sentRecipients.length} recipients`)

    await Email.create({
      recipients,
      subject,
      body: content,
      status: emailStatus,
      attachments,
    })

    return NextResponse.json(
      {
        success: true,
        message: `Email ${emailStatus} to ${sentRecipients.length} recipients`,
        recipients: sentRecipients,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error sending email:", error)
    if (error instanceof Error) {
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    emailStatus = "failed"

    await Email.create({
      recipients,
      subject,
      body: content,
      status: emailStatus,
      attachments,
    })

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to send email",
        recipients: sentRecipients,
      },
      { status: 500 },
    )
  }
}

export const runtime = "nodejs"

