import { Monument, Service, Portfolio, GraniteType, MenuItem, SiteSettings } from '@/data/siteData';

const BASE_URL = 'https://functions.poehali.dev/35b6eecf-bee4-4d3f-ba79-551cb00675bc';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}/?path=${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const raw = await res.json();
  // Platform wraps response body in extra JSON string sometimes
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
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

// Convert flat settings object to SiteSettings type
export function settingsToObj(raw: Record<string, string>): SiteSettings {
  return {
    companyName: raw.companyName ?? '',
    phone: raw.phone ?? '',
    phone2: raw.phone2 ?? '',
    email: raw.email ?? '',
    address: raw.address ?? '',
    workHours: raw.workHours ?? '',
    mapUrl: raw.mapUrl ?? '',
    heroTitle: raw.heroTitle ?? '',
    heroSubtitle: raw.heroSubtitle ?? '',
    metaDescription: raw.metaDescription ?? '',
    notificationEmail: raw.notificationEmail ?? '',
    smtpUser: raw.smtpUser ?? '',
    smtpHost: raw.smtpHost ?? 'smtp.yandex.ru',
    smtpPort: raw.smtpPort ?? '465',
  };
}

export function settingsToFlat(s: SiteSettings): Record<string, string> {
  return {
    companyName: s.companyName,
    phone: s.phone,
    phone2: s.phone2,
    email: s.email,
    address: s.address,
    workHours: s.workHours,
    mapUrl: s.mapUrl,
    heroTitle: s.heroTitle,
    heroSubtitle: s.heroSubtitle,
    metaDescription: s.metaDescription,
    notificationEmail: s.notificationEmail,
    smtpUser: s.smtpUser,
    smtpHost: s.smtpHost,
    smtpPort: s.smtpPort,
  };
}
