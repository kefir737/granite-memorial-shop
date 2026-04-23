import { useState } from 'react';
import {
  defaultMonuments, defaultServices, defaultPortfolio,
  defaultGraniteTypes, defaultMenuItems, defaultSiteSettings,
  Monument, Service, Portfolio, GraniteType, MenuItem, SiteSettings
} from '@/data/siteData';

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
  const [adminOpen, setAdminOpen] = useState(false);
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);

  const currentMonument = currentSlug ? monuments.find(m => m.slug === currentSlug) : null;

  if (adminOpen) {
    return (
      <AdminPanel
        monuments={monuments}
        services={services}
        portfolio={portfolio}
        graniteTypes={graniteTypes}
        menuItems={menuItems}
        settings={settings}
        onUpdateMonuments={setMonuments}
        onUpdateServices={setServices}
        onUpdatePortfolio={setPortfolio}
        onUpdateGraniteTypes={setGraniteTypes}
        onUpdateMenuItems={setMenuItems}
        onUpdateSettings={setSettings}
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
