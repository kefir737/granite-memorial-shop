import {
  Monument,
  Service,
  Portfolio,
  GraniteType,
  MenuItem,
  SiteSettings,
  defaultSiteSettings,
} from '@/data/siteData';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}/${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  return res.json();
}

// Monuments
export const getMonuments = () => apiFetch<Monument[]>('monuments');
export const getMonumentBySlug = (slug: string) => apiFetch<Monument>(`monuments/${slug}`);
export const createMonument = (data: Omit<Monument, 'id'>) =>
  apiFetch<Monument>('monuments', { method: 'POST', body: JSON.stringify(data) });
export const updateMonument = (id: number, data: Partial<Monument>) =>
  apiFetch<Monument>(`monuments/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteMonument = (id: number) =>
  apiFetch<{ deleted: boolean }>(`monuments/${id}`, { method: 'DELETE' });

// Services
export const getServices = () => apiFetch<Service[]>('services');
export const updateService = (id: number, data: Partial<Service>) =>
  apiFetch<Service>(`services/${id}`, { method: 'PUT', body: JSON.stringify(data) });

// Portfolio
export const getPortfolio = () => apiFetch<Portfolio[]>('portfolio');
export const createPortfolioItem = (data: Omit<Portfolio, 'id'>) =>
  apiFetch<Portfolio>('portfolio', { method: 'POST', body: JSON.stringify(data) });
export const updatePortfolioItem = (id: number, data: Partial<Portfolio>) =>
  apiFetch<Portfolio>(`portfolio/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePortfolioItem = (id: number) =>
  apiFetch<{ deleted: boolean }>(`portfolio/${id}`, { method: 'DELETE' });

// Granite types
export const getGraniteTypes = () => apiFetch<GraniteType[]>('granite');
export const updateGraniteType = (id: number, data: Partial<GraniteType>) =>
  apiFetch<GraniteType>(`granite/${id}`, { method: 'PUT', body: JSON.stringify(data) });

// Menu
export const getMenuItems = () => apiFetch<MenuItem[]>('menu');
export const saveMenuItems = (items: MenuItem[]) =>
  apiFetch<MenuItem[]>('menu', { method: 'PUT', body: JSON.stringify(items) });

// Settings
export const getSettings = () => apiFetch<Record<string, string>>('settings');
export const saveSettings = (data: Record<string, string>) =>
  apiFetch<Record<string, string>>('settings', { method: 'PUT', body: JSON.stringify(data) });

const pick = (value: string | undefined, fallback: string) => {
  const v = typeof value === 'string' ? value.trim() : '';
  return v.length ? value! : fallback;
};

// Convert flat settings object to SiteSettings type
export function settingsToObj(raw: Record<string, string>): SiteSettings {
  return {
    companyName: pick(raw.companyName, defaultSiteSettings.companyName),
    phone: pick(raw.phone, defaultSiteSettings.phone),
    phone2: raw.phone2 ?? '',
    phone2Label: pick(raw.phone2Label, defaultSiteSettings.phone2Label),
    email: raw.email ?? '',
    address: raw.address ?? '',
    workHours: raw.workHours ?? '',
    mapUrl: raw.mapUrl ?? '',
    heroTitle: pick(raw.heroTitle, defaultSiteSettings.heroTitle),
    heroSubtitle: pick(raw.heroSubtitle, defaultSiteSettings.heroSubtitle),
    heroImage: raw.heroImage ?? '',
    seoTitle: pick(raw.seoTitle, defaultSiteSettings.seoTitle),
    metaDescription: raw.metaDescription ?? '',
    ogImage: raw.ogImage ?? '',
    siteUrl: pick(raw.siteUrl, defaultSiteSettings.siteUrl),
    notificationEmail: raw.notificationEmail ?? '',
    smtpUser: raw.smtpUser ?? '',
    smtpPassword: raw.smtpPassword ?? '',
    smtpHost: pick(raw.smtpHost, defaultSiteSettings.smtpHost),
    smtpPort: pick(raw.smtpPort, defaultSiteSettings.smtpPort),
    siteIcon: raw.siteIcon ?? '',
    favicon: raw.favicon ?? '',
  };
}

// Pages
export type PageMenuLocation = 'header' | 'footer';
export type Page = {
  id: number;
  title: string;
  slug: string;
  template: 'landing' | 'catalog' | 'content' | 'contacts';
  visible: boolean;
  content: string;
  customHtml: string;
  sortOrder: number;
  menuAssignments: PageMenuLocation[];
};
export const getPages = () => apiFetch<Page[]>('pages');
export const createPage = (data: Omit<Page, 'id' | 'menuAssignments' | 'customHtml'>) =>
  apiFetch<Page>('pages', { method: 'POST', body: JSON.stringify({ ...data, customHtml: '' }) });
export const updatePage = (id: number, data: Partial<Page>) =>
  apiFetch<Page>(`pages/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const updatePageMenuAssignments = (id: number, locations: PageMenuLocation[]) =>
  apiFetch<{ pageId: number; locations: PageMenuLocation[] }>(`pages/${id}/menu`, {
    method: 'PATCH',
    body: JSON.stringify({ locations }),
  });
export const deletePage = (id: number) =>
  apiFetch<{ deleted: boolean }>(`pages/${id}`, { method: 'DELETE' });

export function settingsToFlat(s: SiteSettings): Record<string, string> {
  return {
    companyName: s.companyName,
    phone: s.phone,
    phone2: s.phone2,
    phone2Label: s.phone2Label,
    email: s.email,
    address: s.address,
    workHours: s.workHours,
    mapUrl: s.mapUrl,
    heroTitle: s.heroTitle,
    heroSubtitle: s.heroSubtitle,
    heroImage: s.heroImage,
    seoTitle: s.seoTitle,
    metaDescription: s.metaDescription,
    ogImage: s.ogImage,
    siteUrl: s.siteUrl,
    notificationEmail: s.notificationEmail,
    smtpUser: s.smtpUser,
    smtpPassword: s.smtpPassword,
    smtpHost: s.smtpHost,
    smtpPort: s.smtpPort,
    siteIcon: s.siteIcon,
    favicon: s.favicon,
  };
}