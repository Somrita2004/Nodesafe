
/**
 * Format file size to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Get file type category based on mime type or extension
 */
export function getFileType(fileName: string): "document" | "image" | "video" | "audio" | "archive" | "other" {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";

  // Image files
  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension)) {
    return "image";
  }

  // Document files
  if (["pdf", "doc", "docx", "txt", "md", "rtf", "xls", "xlsx", "ppt", "pptx"].includes(extension)) {
    return "document";
  }

  // Video files
  if (["mp4", "webm", "mov", "avi", "mkv"].includes(extension)) {
    return "video";
  }

  // Audio files
  if (["mp3", "wav", "ogg", "flac", "aac"].includes(extension)) {
    return "audio";
  }

  // Archive files
  if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) {
    return "archive";
  }

  // Default to other
  return "other";
}

/**
 * Format date to human-readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

/**
 * Get file icon based on file type
 */
export function getFileIcon(fileName: string): string {
  const fileType = getFileType(fileName);
  
  switch (fileType) {
    case "document":
      return "file-text";
    case "image":
      return "image";
    case "video":
      return "video";
    case "audio":
      return "music";
    case "archive":
      return "archive";
    default:
      return "file";
  }
}
