export interface Attachment {
    filename?: string;
    content?: string | Buffer;
    path?: string;
    contentType?: string;
    encoding?: string;
    headers?: Record<string, string>;
    cid?: string; // Content ID for inline images
}

export interface EmailType {
    id: string;
    recipients: string[];
    subject: string;
    body: string;
    status: "send" | "failed"; // Email status
    attachments?: Attachment[];
    createdAt: Date;
}