    // utils/slug.js
    export function generateSlug(title) {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric characters (except spaces and hyphens)
        .trim() // Trim leading/trailing whitespace
        .replace(/\s+/g, '-'); // Replace spaces with single hyphens
    }