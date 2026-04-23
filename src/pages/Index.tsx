import { useState, useEffect } from 'react';
import {
  defaultMonuments, defaultServices, defaultPortfolio,
  defaultGraniteTypes, defaultMenuItems, defaultSiteSettings,
  Monument, Service, Portfolio, GraniteType, MenuItem, SiteSettings
} from '@/data/siteData';
import {
  getMonuments, getServices, getPortfolio, getGraniteTypes,
  getMenuItems, getSettings, settingsToObj,
  updateMonument, createMonument, deleteMonument,
  updateService, createPortfolioItem, deletePortfolioItem,
  updateGraniteType, saveMenuItems, saveSettings, settingsToFlat,
} from '@/lib/api';

import Header from '@/components/site/Header';
import HeroSection from '@/components/site/HeroSection';
import CatalogSection from '@/components/site/CatalogSection';
import ServicesSection from '@/components/site/ServicesSection';
import PortfolioSection from '@/components/site/PortfolioSection';
import GraniteSection from '@/components/site/GraniteSection';
import ContactsSection from '@/components/site/ContactsSection';
import Footer from '@/components/site/Footer';
import AdminPanel from '@/components/admin/AdminPanel';
import MonumentPage from './MonumentPage';

export default function Index() {
  const [monuments, setMonuments] = useState<Monument[]>(defaultMonuments);
  const [services, setServices] = useState<Service[]>(defaultServices);
  const [portfolio, setPortfolio] = useState<Portfolio[]>(defaultPortfolio);
  const [graniteTypes, setGraniteTypes] = useState<GraniteType[]>(defaultGraniteTypes);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenuItems);
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [loading, setLoading] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);

  // Load all data from DB on mount
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
      if (rawSettings) setSettings(settingsToObj(rawSettings));
    }).finally(() => setLoading(false));
  }, []);

  const currentMonument = currentSlug ? monuments.find(m => m.slug === currentSlug) : null;

  // Admin handlers — save to DB, update local state
  const handleUpdateMonuments = async (updated: Monument[]) => {
    setMonuments(updated);
    // Find what changed vs current
    const current = monuments;
    for (const m of updated) {
      const old = current.find(x => x.id === m.id);
      if (!old) {
        await createMonument(m).catch(console.error);
      } else if (JSON.stringify(old) !== JSON.stringify(m)) {
        await updateMonument(m.id, m).catch(console.error);
      }
    }
    for (const m of current) {
      if (!updated.find(x => x.id === m.id)) {
        await deleteMonument(m.id).catch(console.error);
      }
    }
    // Refresh from DB
    getMonuments().then(list => { if (list?.length) setMonuments(list); }).catch(() => {});
  };

  const handleUpdateServices = async (updated: Service[]) => {
    setServices(updated);
    for (const s of updated) {
      await updateService(s.id, s).catch(console.error);
    }
  };

  const handleUpdatePortfolio = async (updated: Portfolio[]) => {
    const current = portfolio;
    setPortfolio(updated);
    for (const p of updated) {
      if (!current.find(x => x.id === p.id)) {
        await createPortfolioItem(p).catch(console.error);
      }
    }
    for (const p of current) {
      if (!updated.find(x => x.id === p.id)) {
        await deletePortfolioItem(p.id).catch(console.error);
      }
    }
    getPortfolio().then(list => { if (list?.length) setPortfolio(list); }).catch(() => {});
  };

  const handleUpdateGraniteTypes = async (updated: GraniteType[]) => {
    setGraniteTypes(updated);
    for (const g of updated) {
      await updateGraniteType(g.id, g).catch(console.error);
    }
  };

  const handleUpdateMenuItems = async (updated: MenuItem[]) => {
    setMenuItems(updated);
    await saveMenuItems(updated).catch(console.error);
  };

  const handleUpdateSettings = async (updated: SiteSettings) => {
    setSettings(updated);
    await saveSettings(settingsToFlat(updated)).catch(console.error);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-body text-sm text-muted-foreground">Загружаем каталог...</p>
        </div>
      </div>
    );
  }

  if (adminOpen) {
    return (
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
        onClose={() => setAdminOpen(false)}
      />
    );
  }

  if (currentMonument) {
    return (
      <MonumentPage
        monument={currentMonument}
        settings={settings}
        onBack={() => setCurrentSlug(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        menuItems={menuItems}
        settings={settings}
        onAdminClick={() => setAdminOpen(true)}
      />
      <main className="pt-16">
        <HeroSection settings={settings} />
        <CatalogSection
          monuments={monuments}
          onMonumentClick={(slug) => { setCurrentSlug(slug); window.scrollTo(0, 0); }}
        />
        <ServicesSection services={services} />
        <PortfolioSection portfolio={portfolio} />
        <GraniteSection graniteTypes={graniteTypes} />
        <ContactsSection settings={settings} />
      </main>
      <Footer settings={settings} menuItems={menuItems} />
    </div>
  );
}
