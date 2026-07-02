import { SiteSettings } from '@/data/siteData';
import { Page } from '@/lib/api';

export function setMeta(name: string, content: string, attr = 'name') {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function setFavicon(href: string, rel: string) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function applySiteSeo(s: SiteSettings) {
  if (s.seoTitle) document.title = s.seoTitle;
  setMeta('description', s.metaDescription);
  setMeta('og:title', s.seoTitle || s.heroTitle, 'property');
  setMeta('og:description', s.metaDescription, 'property');
  if (s.ogImage) setMeta('og:image', s.ogImage, 'property');
  if (s.favicon) setFavicon(s.favicon, 'icon');
  if (s.siteIcon) {
    setFavicon(s.siteIcon, 'apple-touch-icon');
    setMeta('theme-color', '#1a1a1a');
  }
}

export function applyPageSeo(page: Page, settings: SiteSettings) {
  document.title = page.seoTitle || `${page.title} — ${settings.companyName}`;
  setMeta('description', page.seoDescription || settings.metaDescription);
  setMeta('keywords', page.seoKeywords);
  setMeta('og:title', page.seoTitle || page.title, 'property');
  setMeta('og:description', page.seoDescription || settings.metaDescription, 'property');
}
