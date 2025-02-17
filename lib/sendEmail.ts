// "use server";

// import nodemailer from "nodemailer";
// import Email from "@/models/Email"; // Adjust path as needed
// import dbConnect from "@/lib/dbConnect"; // Ensure this function connects to your MongoDB
// import { revalidatePath } from "next/cache";

// interface Attachment {
//   filename?: string;
//   content?: string | Buffer;
//   path?: string;
//   contentType?: string;
//   encoding?: string;
//   headers?: Record<string, string>;
//   cid?: string; // Content ID for inline images
// }

// interface EmailData {
//   subject: string;
//   content: string;
//   recipients: string[];
//   attachments?: Attachment[];
// }

// const BATCH_SIZE = 100;

// async function sendBatch(
//   transporter: nodemailer.Transporter,
//   emailData: EmailData,
//   batch: string[]
// ) {
//   try {
//     const info = await transporter.sendMail({
//       from: process.env.EMAIL,
//       bcc: batch.join(", "), // Use BCC for privacy
//       subject: emailData.subject,
//       html: emailData.content, // Use HTML content
//       attachments: emailData.attachments?.map((attachment) => ({ filename: attachment.filename, path: attachment.path })),
//     });

//     console.log("Batch sent:", info.messageId);
//     return { success: true, recipients: batch };
//   } catch (error) {
//     console.error("Failed to send batch:", error);
//     return { success: false, recipients: batch };
//   }
// }

// export async function sendEmail(emailData: EmailData) {
//   await dbConnect(); // Ensure MongoDB is connected

//   // Validation: Check sender details
//   if (!emailData.recipients) {
//     return {
//       success: false,
//       message: "Sender email details are missing",
//       recipients: [],
//     };
//   }

//   const transporter = nodemailer.createTransport({
//     service: "gmail", // Assumes Gmail, change if using a different provider
//     auth: {
//       user: process.env.EMAIL,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const { recipients, subject, content, attachments } = emailData;
//   const totalBatches = Math.ceil(recipients.length / BATCH_SIZE);
//   const sentRecipients: string[] = [];
//   let emailStatus: "send" | "failed" = "send"; // Default to 'send'

//   try {
//     for (let i = 0; i < totalBatches; i++) {
//       const start = i * BATCH_SIZE;
//       const end = start + BATCH_SIZE;
//       const batch = recipients.slice(start, end);

//       const batchResult = await sendBatch(transporter, emailData, batch);
//       sentRecipients.push(...batchResult.recipients);

//       if (!batchResult.success) {
//         emailStatus = "failed"; // Mark email as failed if any batch fails
//       }

//       if (i < totalBatches - 1) {
//         await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 sec delay
//       }
//     }

//     console.log(`Email sent to ${sentRecipients.length} recipients`);

//     // Save email record to database
//     await Email.create({
//       recipients,
//       subject,
//       body: content,
//       status: emailStatus,
//       attachments,
//     });
//     revalidatePath("/")
//     return {
//       success: true,
//       message: `Email ${emailStatus} to ${sentRecipients.length} recipients`,
//       recipients: sentRecipients,
//     };
//   } catch (error) {
//     console.error("Error sending email:", error);
//     emailStatus = "failed";

//     // Save failed email attempt to the database
//     await Email.create({
//       recipients,
//       subject,
//       body: content,
//       status: emailStatus,
//       attachments,
//     });
//     revalidatePath("/")
//     return {
//       success: false,
//       message: error instanceof Error ? error.message : "Failed to send email",
//       recipients: sentRecipients,
//     };
//   }
// }



"use server"

import { getGmailTransporter, getAuthUrl } from "../lib/gmail"
import Email from "../models/Email"
import dbConnect from "../lib/dbConnect"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import type nodemailer from "nodemailer"
import { EmailType } from "@/types/Email"

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
    const info = await transporter.sendMail({
      from: process.env.GOOGLE_USER_EMAIL,
      bcc: batch.join(", "),
      subject: emailData.subject,
      html: emailData.content,
      attachments: emailData.attachments?.map((attachment) => ({
        filename: attachment.filename,
        path: attachment.path,
      })),
    })

    console.log("Batch sent:", info.messageId)
    return { success: true, recipients: batch }
  } catch (error) {
    console.error("Failed to send batch:", error)
    return { success: false, recipients: batch }
  }
}






export async function resendEmail(emailData: EmailType) {
  await dbConnect()

  if (!emailData.recipients || emailData.recipients.length === 0) {
    return {
      success: false,
      message: "Recipients are missing",
      recipients: [],
    }
  }

  const cookieStore = cookies()
  const accessToken = cookieStore.get("gmail_access_token")
  const refreshToken = cookieStore.get("gmail_refresh_token")

  if (!accessToken || !refreshToken) {
    console.log("No tokens found, starting OAuth flow")
    try {
      const authUrl = getAuthUrl()
      console.log("Auth URL generated:", authUrl)
      return {
        success: false,
        message: "Authentication required",
        authUrl: authUrl,
      }
    } catch (error) {
      console.error("Error generating auth URL:", error)
      return {
        success: false,
        message: "Failed to initialize authentication. Please check server logs.",
        recipients: [],
      }
    }
  }

  let transporter
  try {
    transporter = await getGmailTransporter({
      access_token: accessToken.value,
      refresh_token: refreshToken.value,
    })
  } catch (error) {
    console.error("Failed to create Gmail transporter:", error)
    return {
      success: false,
      message: "Failed to initialize email service. Please try again later.",
      recipients: [],
    }
  }

  const { recipients } = emailData
  const totalBatches = Math.ceil(recipients.length / BATCH_SIZE)
  const sentRecipients: string[] = []
  let emailStatus: "send" | "failed" = "send"

  try {
    for (let i = 0; i < totalBatches; i++) {
      const start = i * BATCH_SIZE
      const end = start + BATCH_SIZE
      const batch = recipients.slice(start, end)

      const batchResult = await sendBatch(
        transporter,
        {
          recipients: emailData.recipients,
          content: emailData.body,
          subject: emailData.subject,
          attachments: emailData.attachments
        },
        batch)
      sentRecipients.push(...batchResult.recipients)

      if (!batchResult.success) {
        emailStatus = "failed"
      }

      if (i < totalBatches - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    console.log(`Email ${emailStatus} to ${sentRecipients.length} recipients`)

    await Email.updateOne(
      { _id: emailData.id }, // Find the email by its ID
      { $set: { status: emailStatus } } // Update only the status field
    );

    revalidatePath("/")
    return {
      success: true,
      message: `Email ${emailStatus} to ${sentRecipients.length} recipients`,
      recipients: sentRecipients,
    }
  } catch (error) {
    console.error("Error sending email:", error)
    revalidatePath("/")
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send email",
      recipients: sentRecipients,
    }
  }
}





























export async function sendEmail(emailData: EmailData) {
  await dbConnect()

  if (!emailData.recipients || emailData.recipients.length === 0) {
    return {
      success: false,
      message: "Recipients are missing",
      recipients: [],
    }
  }

  const cookieStore = cookies()
  const accessToken = cookieStore.get("gmail_access_token")
  const refreshToken = cookieStore.get("gmail_refresh_token")

  if (!accessToken || !refreshToken) {
    console.log("No tokens found, starting OAuth flow")
    try {
      const authUrl = getAuthUrl()
      console.log("Auth URL generated:", authUrl)
      return {
        success: false,
        message: "Authentication required",
        authUrl: authUrl,
      }
    } catch (error) {
      console.error("Error generating auth URL:", error)
      return {
        success: false,
        message: "Failed to initialize authentication. Please check server logs.",
        recipients: [],
      }
    }
  }

  let transporter
  try {
    transporter = await getGmailTransporter({
      access_token: accessToken.value,
      refresh_token: refreshToken.value,
    })
  } catch (error) {
    console.error("Failed to create Gmail transporter:", error)
    return {
      success: false,
      message: "Failed to initialize email service. Please try again later.",
      recipients: [],
    }
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

      const batchResult = await sendBatch(transporter, emailData, batch)
      sentRecipients.push(...batchResult.recipients)

      if (!batchResult.success) {
        emailStatus = "failed"
      }

      if (i < totalBatches - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    console.log(`Email ${emailStatus} to ${sentRecipients.length} recipients`)

    await Email.create({
      recipients,
      subject,
      body: content,
      status: emailStatus,
      attachments,
    })
    revalidatePath("/")
    return {
      success: true,
      message: `Email ${emailStatus} to ${sentRecipients.length} recipients`,
      recipients: sentRecipients,
    }
  } catch (error) {
    console.error("Error sending email:", error)
    emailStatus = "failed"

    await Email.create({
      recipients,
      subject,
      body: content,
      status: emailStatus,
      attachments,
    })
    revalidatePath("/")
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send email",
      recipients: sentRecipients,
    }
  }


  // const emailRequestData = {
  //   emailData,
  //   tokens: {
  //     access_token: accessToken.value,
  //     refresh_token: refreshToken.value,
  //   },
  // }

  // try {
  //   // Send the data to the Express backend
  //   console.log("calling api")
  //   const response = await fetch(`http://localhost:5000/send-email`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(emailRequestData),
  //   })
  //   if (response.status !== 200) {
  //     try {
  //       const authUrl = getAuthUrl()
  //       console.log("Auth URL generated:", authUrl)
  //       return {
  //         success: false,
  //         message: "Authentication required",
  //         authUrl: authUrl,
  //       }
  //     } catch (error) {
  //       console.error("Error generating auth URL:", error)
  //       return {
  //         success: false,
  //         message: "Failed to initialize authentication. Please check server logs.",
  //         recipients: [],
  //       }
  //     }
  //   }
  //   revalidatePath("/")

  //   if (!response.ok) {
  //     throw new Error("Failed to send email")
  //   }

  //   const result = await response.json()
  //   return result
  // } catch (error) {
  //   console.error("Error sending email:", error)
  //   return {
  //     success: false,
  //     message: error instanceof Error ? error.message : "Failed to send email",
  //     recipients: [],
  //   }
  // }
}

