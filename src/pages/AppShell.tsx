import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  defaultMonuments, defaultServices, defaultPortfolio,
  defaultGraniteTypes, defaultMenuItems, defaultSiteSettings,
  Monument, Service, Portfolio, GraniteType, MenuItem, SiteSettings
} from '@/data/siteData';
import {
  getMonuments, getServices, getPortfolio, getGraniteTypes,
  getMenuItems, getSettings, settingsToObj,
  updateMonument, createMonument, deleteMonument,
  updateService, updateGraniteType, saveMenuItems, saveSettings, settingsToFlat,
} from '@/lib/api';
import Index from './Index';
import { dismissStaticHero } from '@/lib/bootstrapStaticHero';

const AdminPanel = lazy(() => import('@/components/admin/AdminPanel'));
const DynamicPage = lazy(() => import('./DynamicPage'));
const ConstructorPage = lazy(() => import('./ConstructorPage'));
const MonumentRoutePage = lazy(() => import('./MonumentRoutePage'));
const NotFound = lazy(() => import('./NotFound'));

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function setMeta(name: string, content: string, attr = 'name') {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
  el.setAttribute('content', content);
}

function setFavicon(href: string, rel: string) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function applySeоTags(s: SiteSettings) {
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

export default function AppShell() {
  const [monuments, setMonuments] = useState<Monument[]>(defaultMonuments);
  const [services, setServices] = useState<Service[]>(defaultServices);
  const [portfolio, setPortfolio] = useState<Portfolio[]>(defaultPortfolio);
  const [graniteTypes, setGraniteTypes] = useState<GraniteType[]>(defaultGraniteTypes);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenuItems);
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [adminOpen, setAdminOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    dismissStaticHero();
  }, []);

  useEffect(() => {
    Promise.all([
      getMonuments().catch(() => defaultMonuments),
      getServices().catch(() => defaultServices),
      getPortfolio().catch(() => defaultPortfolio),
      getGraniteTypes().catch(() => defaultGraniteTypes),
      getMenuItems().catch(() => defaultMenuItems),
      getSettings().catch(() => null),
    ]).then(([mon, svc, port, gran, menu, rawSettings]) => {
      if (mon?.length) setMonuments(mon);
      if (svc?.length) setServices(svc);
      if (port?.length) setPortfolio(port);
      if (gran?.length) setGraniteTypes(gran);
      if (menu?.length) setMenuItems(menu);
      if (rawSettings) {
        const s = settingsToObj(rawSettings);
        setSettings(s);
        applySeоTags(s);
      }
    });
  }, []);

  const handleUpdateMonuments = async (updated: Monument[]) => {
    setMonuments(updated);
    const current = monuments;
    for (const m of updated) {
      const old = current.find(x => x.id === m.id);
      if (!old) await createMonument(m).catch(console.error);
      else if (JSON.stringify(old) !== JSON.stringify(m)) await updateMonument(m.id, m).catch(console.error);
    }
    for (const m of current) {
      if (!updated.find(x => x.id === m.id)) await deleteMonument(m.id).catch(console.error);
    }
    getMonuments().then(list => { if (list?.length) setMonuments(list); }).catch(() => {});
  };

  const handleUpdateServices = async (updated: Service[]) => {
    setServices(updated);
    for (const s of updated) await updateService(s.id, s).catch(console.error);
  };

  const handleUpdatePortfolio = (updated: Portfolio[]) => setPortfolio(updated);

  const handleUpdateGraniteTypes = async (updated: GraniteType[]) => {
    setGraniteTypes(updated);
    for (const g of updated) await updateGraniteType(g.id, g).catch(console.error);
  };

  const handleUpdateMenuItems = async (updated: MenuItem[]) => {
    setMenuItems(updated);
    saveMenuItems(updated).catch(console.error);
  };

  const handleRefreshMenu = () => {
    getMenuItems().then(list => { if (list?.length) setMenuItems(list); }).catch(() => {});
  };

  const handleUpdateSettings = async (updated: SiteSettings): Promise<boolean> => {
    setSettings(updated);
    applySeоTags(updated);
    try {
      await saveSettings(settingsToFlat(updated));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const sharedProps = { settings, menuItems, onAdminClick: () => setAdminOpen(true) };

  if (adminOpen) {
    return (
      <Suspense fallback={<RouteFallback />}>
        <AdminPanel
          monuments={monuments}
          services={services}
          portfolio={portfolio}
          graniteTypes={graniteTypes}
          menuItems={menuItems}
          settings={settings}
          onUpdateMonuments={handleUpdateMonuments}
          onUpdateServices={handleUpdateServices}
          onUpdatePortfolio={handleUpdatePortfolio}
          onUpdateGraniteTypes={handleUpdateGraniteTypes}
          onUpdateMenuItems={handleUpdateMenuItems}
          onUpdateSettings={handleUpdateSettings}
          onRefreshMenu={handleRefreshMenu}
          onClose={() => { setAdminOpen(false); navigate('/'); }}
        />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/admin" element={<AdminRedirect open={() => setAdminOpen(true)} />} />
        <Route path="/" element={
          <Index
            {...sharedProps}
            monuments={monuments}
            services={services}
            portfolio={portfolio}
            graniteTypes={graniteTypes}
            onUpdateMonuments={handleUpdateMonuments}
            onUpdateServices={handleUpdateServices}
            onUpdatePortfolio={handleUpdatePortfolio}
            onUpdateGraniteTypes={handleUpdateGraniteTypes}
          />
        } />
        <Route path="/konstruktor" element={
          <ConstructorPage {...sharedProps} />
        } />
        <Route path="/monument/:slug" element={
          <MonumentRoutePage {...sharedProps} monuments={monuments} />
        } />
        <Route path="/:slug" element={<DynamicPage {...sharedProps} monuments={monuments} portfolio={portfolio} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

function AdminRedirect({ open }: { open: () => void }) {
  const navigate = useNavigate();
  useEffect(() => {
    open();
    navigate('/', { replace: true });
  }, []);
  return null;
}