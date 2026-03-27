/**
 * Utility to get absolute public URLs for metadata (Open Graph, Twitter).
 * Essential because internal Docker URLs (e.g., http://wedding-backend:8080)
 * are not accessible to external crawlers like Facebook.
 */
export function getPublicImageUrl(url: string | undefined | null): string {
  if (!url) {
    // Fallback to a default site-wide image if no URL is provided
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
    return `${siteUrl.replace(/\/$/, "")}/logo.png`;
  }

  if (url.startsWith("http")) {
    return url;
  }

  // For relative URLs, we need to prefix with a public base URL.
  // Use NEXT_PUBLIC_API_URL if it's an API-hosted image, 
  // or NEXT_PUBLIC_SITE_URL if it's a local asset.
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  if (url.startsWith("/api")) {
    if (apiBase) {
      return `${apiBase.replace(/\/$/, "")}${url}`;
    }
    // If no API URL is set, assume it might be proxied by the frontend
    return `${siteUrl.replace(/\/$/, "")}${url}`;
  }

  // For other local assets
  return `${siteUrl.replace(/\/$/, "")}${url.startsWith("/") ? url : `/${url}`}`;
}
