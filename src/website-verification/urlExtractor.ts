const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*/gi;

export function extractUrls(text: string): string[] {
  const matches = text.match(urlRegex);
  if (!matches) {
    return [];
  }
  // Use a Set to get unique URLs
  return Array.from(new Set(matches));
} 