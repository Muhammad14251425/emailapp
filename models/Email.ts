import mongoose, { Document, Schema, model, models } from "mongoose";

// Define the attachment interface based on Nodemailer's format
interface IAttachment {
  filename?: string;
  content?: string | Buffer;
  path?: string;
  contentType?: string;
  encoding?: string;
  headers?: { [key: string]: string };
  cid?: string; // Content ID for inline images
}

// Define the Email interface
interface IEmail extends Document {
  recipients: string[];
  subject: string;
  body: string;
  status: "send" | "failed";
  attachments?: IAttachment[];
  createdAt: Date;
}

// Define the Email Schema
const EmailSchema = new Schema<IEmail>({
  recipients: { type: [String], required: true }, // Array of recipient emails
  subject: { type: String, required: true }, // Email subject
  body: { type: String, required: true }, // Email body
  status: { type: String, enum: ["send", "failed"], required: true }, // Status
  attachments: [
    {
      filename: String,
      content: Buffer,
      path: String,
      contentType: String,
      encoding: String,
      headers: Object,
      cid: String, // Content ID for inline images
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

// Creating and exporting the Email model
const Email = models.Email || model<IEmail>("Email", EmailSchema);
export default Email;
