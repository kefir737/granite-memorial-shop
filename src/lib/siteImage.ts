/** Local /images/*.jpg paths → WebP with JPG fallback in <picture>. */
export function imageSources(src: string): { webp: string; jpg: string } {
  if (src.endsWith('.webp')) {
    return { webp: src, jpg: src.replace(/\.webp$/, '.jpg') };
  }
  if (src.endsWith('.jpg') || src.endsWith('.jpeg')) {
    return { webp: src.replace(/\.(jpe?g)$/, '.webp'), jpg: src };
  }
  return { webp: src, jpg: src };
}

export function preferWebp(src: string): string {
  return imageSources(src).webp;
}
