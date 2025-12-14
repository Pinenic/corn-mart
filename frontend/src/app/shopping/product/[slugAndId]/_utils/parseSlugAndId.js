// app/product/[slugAndId]/_utils/parseSlugAndId.js
export function parseSlugAndId(combined) {
  const match = combined.match(
    /([a-zA-Z0-9-]+)-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/
  );

  if (!match) {
    return { slug: combined, id: null };
  }

  console.log(match[2]);
  return {
    slug: match[1],
    id: match[2],
  };
}
