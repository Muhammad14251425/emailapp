"use server"
import nodemailer from "nodemailer"

interface Attachment {
  filename: string
  path: string
}

interface EmailData {
  subject: string
  content: string
  recipients: string[]
  attachments: Attachment[]
}

const BATCH_SIZE = 100

async function sendBatch(transporter: nodemailer.Transporter, emailData: EmailData, batch: string[]) {
  
  const info = await transporter.sendMail({
    from: process.env.EMAIL,
    bcc: batch.join(", "), // Use BCC for privacy
    subject: emailData.subject,
    html: emailData.content, // Use HTML content
    attachments: emailData.attachments,
  })
  console.log("Batch sent:", info.messageId)
  return batch
}

export async function sendEmail(emailData: EmailData) {
  const transporter = nodemailer.createTransport({
    service: "gmail", // Assumes you're using Gmail. Change if using a different provider
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  })

  const { recipients } = emailData
  const totalBatches = Math.ceil(recipients.length / BATCH_SIZE)
  const sentRecipients: string[] = []

  try {
    for (let i = 0; i < totalBatches; i++) {
      const start = i * BATCH_SIZE
      const end = start + BATCH_SIZE
      const batch = recipients.slice(start, end)

      const batchSentRecipients = await sendBatch(transporter, emailData, batch)
      sentRecipients.push(...batchSentRecipients)

      // Add a delay between batches to avoid overwhelming the server
      if (i < totalBatches - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000)) // 1 second delay
      }
    }

    console.log(`Email sent to ${sentRecipients.length} recipients`)
    return {
      success: true,
      message: `Email sent successfully to ${sentRecipients.length} recipients`,
      recipients: sentRecipients,
    }
  } catch (error) {
    console.error("Error sending email:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send email",
      recipients: sentRecipients,
    }
  }
}

