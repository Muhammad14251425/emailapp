"use server";

import nodemailer from "nodemailer";
import Email from "@/models/Email"; // Adjust path as needed
import dbConnect from "@/lib/dbConnect"; // Ensure this function connects to your MongoDB
import { revalidatePath } from "next/cache";

interface Attachment {
  filename?: string;
  content?: string | Buffer;
  path?: string;
  contentType?: string;
  encoding?: string;
  headers?: Record<string, string>;
  cid?: string; // Content ID for inline images
}

interface EmailData {
  subject: string;
  content: string;
  recipients: string[];
  attachments?: Attachment[];
}

const BATCH_SIZE = 100;

async function sendBatch(
  transporter: nodemailer.Transporter,
  emailData: EmailData,
  batch: string[]
) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      bcc: batch.join(", "), // Use BCC for privacy
      subject: emailData.subject,
      html: emailData.content, // Use HTML content
      attachments: emailData.attachments?.map((attachment) => ({ filename: attachment.filename, path: attachment.path })),
    });

    console.log("Batch sent:", info.messageId);
    return { success: true, recipients: batch };
  } catch (error) {
    console.error("Failed to send batch:", error);
    return { success: false, recipients: batch };
  }
}

export async function sendEmail(emailData: EmailData) {
  await dbConnect(); // Ensure MongoDB is connected

  // Validation: Check sender details
  if (!emailData.recipients) {
    return {
      success: false,
      message: "Sender email details are missing",
      recipients: [],
    };
  }

  const transporter = nodemailer.createTransport({
    service: "gmail", // Assumes Gmail, change if using a different provider
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  const { recipients, subject, content, attachments } = emailData;
  const totalBatches = Math.ceil(recipients.length / BATCH_SIZE);
  const sentRecipients: string[] = [];
  let emailStatus: "send" | "failed" = "send"; // Default to 'send'

  try {
    for (let i = 0; i < totalBatches; i++) {
      const start = i * BATCH_SIZE;
      const end = start + BATCH_SIZE;
      const batch = recipients.slice(start, end);

      const batchResult = await sendBatch(transporter, emailData, batch);
      sentRecipients.push(...batchResult.recipients);

      if (!batchResult.success) {
        emailStatus = "failed"; // Mark email as failed if any batch fails
      }

      if (i < totalBatches - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 sec delay
      }
    }

    console.log(`Email sent to ${sentRecipients.length} recipients`);

    // Save email record to database
    await Email.create({
      recipients,
      subject,
      body: content,
      status: emailStatus,
      attachments,
    });
    revalidatePath("/")
    return {
      success: true,
      message: `Email ${emailStatus} to ${sentRecipients.length} recipients`,
      recipients: sentRecipients,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    emailStatus = "failed";

    // Save failed email attempt to the database
    await Email.create({
      recipients,
      subject,
      body: content,
      status: emailStatus,
      attachments,
    });
    revalidatePath("/")
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send email",
      recipients: sentRecipients,
    };
  }
}
