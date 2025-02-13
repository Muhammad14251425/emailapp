export function getDirectDownloadLink(url: string): string | null {
    const driveFileRegex = /https:\/\/drive\.google\.com\/file\/d\/([^/]+)/;
    const docsFileRegex = /https:\/\/docs\.google\.com\/document\/d\/([^/]+)/;

    const driveMatch = url.match(driveFileRegex);
    const docsMatch = url.match(docsFileRegex);

    if (driveMatch) {
        // Convert Google Drive file link to direct download link
        return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
    } else if (docsMatch) {
        // Convert Google Docs link to a PDF download link
        return `https://docs.google.com/document/d/${docsMatch[1]}/export?format=pdf`;
    } else {
        console.error("Invalid Google Drive or Docs link.");
        return null;
    }
}

export function getOriginalGoogleLink(directLink: string): string | null {
    const driveDownloadRegex = /https:\/\/drive\.google\.com\/uc\?export=download&id=([^&]+)/;
    const docsDownloadRegex = /https:\/\/docs\.google\.com\/document\/d\/([^/]+)\/export\?format=pdf/;

    const driveMatch = directLink.match(driveDownloadRegex);
    const docsMatch = directLink.match(docsDownloadRegex);

    if (driveMatch) {
        // Convert direct download link back to Google Drive file link
        return `https://drive.google.com/file/d/${driveMatch[1]}/view`;
    } else if (docsMatch) {
        // Convert direct download link back to Google Docs link
        return `https://docs.google.com/document/d/${docsMatch[1]}/edit`;
    } else {
        console.error("Invalid direct download link.");
        return null;
    }
}


export const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout
    return (...args: any[]) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => func(...args), delay)
    }
}