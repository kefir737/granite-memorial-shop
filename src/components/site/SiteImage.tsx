import { imageSources } from '@/lib/siteImage';

interface SiteImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  onLoad?: () => void;
}

export default function SiteImage({
  src,
  alt,
  className,
  loading = 'lazy',
  fetchPriority,
  onLoad,
}: SiteImageProps) {
  const { webp, jpg } = imageSources(src);

  return (
    <picture>
      <source srcSet={webp} type="image/webp" />
      <img
        src={jpg}
        alt={alt}
        className={className}
        loading={loading}
        fetchPriority={fetchPriority}
        onLoad={onLoad}
        decoding="async"
      />
    </picture>
  );
}
