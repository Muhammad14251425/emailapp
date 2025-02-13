import { google } from "googleapis"
import { JWT } from "google-auth-library"

// Replace these with your actual credentials from Google Cloud Console
const CREDENTIALS = {
    type: "service_account",
    project_id: "empyrean-button-436319-c1",
    private_key_id: "655f1d722555d1aea64a687ed4d1c907ab761c19",
    private_key: process.env.GOOGLE_PRIVATE_KEY,
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: "108975631351241637969",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/test1-365%40empyrean-button-436319-c1.iam.gserviceaccount.com",
}

const auth = new JWT({
    email: CREDENTIALS.client_email,
    key: CREDENTIALS.private_key,
    scopes: ["https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive.metadata"],
})

export const drive = google.drive({ version: "v3", auth })
export const FOLDER_ID = "1tKPBAl11zl7pg4Xa-FBmEQj8T1g6gdYI"

