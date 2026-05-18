/** Cloudinary URL helpers for sharper Next/Image loads. */

export function optimizeCloudinaryUrl(url: string, width = 1200): string {
  if (!url?.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }
  if (url.includes("c_limit") || url.includes(",w_")) {
    return url;
  }
  return url.replace("/upload/", `/upload/c_limit,w_${width},q_auto:good,f_auto/`);
}

/** Prefer hero + gallery shots; skip tiny marketing/description sprites in the carousel. */
export function pickProductGalleryImages(images: string[]): string[] {
  if (!images?.length) return [];

  const hero = images.filter((u) => /01-hero|\/hero[.-]/i.test(u));
  const gallery = images.filter((u) => /02-gallery|gallery-\d/i.test(u));
  const other = images.filter(
    (u) =>
      !/description/i.test(u) &&
      !hero.includes(u) &&
      !gallery.includes(u),
  );

  const combined = [...hero, ...gallery, ...other];
  const unique = [...new Set(combined)];
  return unique.length > 0 ? unique : images;
}

export function optimizeGalleryImages(images: string[], width = 1200): string[] {
  return pickProductGalleryImages(images).map((u) => optimizeCloudinaryUrl(u, width));
}
