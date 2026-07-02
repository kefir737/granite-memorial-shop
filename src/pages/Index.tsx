import { useNavigate } from 'react-router-dom';
import { Monument, Service, Portfolio, GraniteType, MenuItem, SiteSettings } from '@/data/siteData';

import Header from '@/components/site/Header';
import HeroSection from '@/components/site/HeroSection';
import CatalogSection from '@/components/site/CatalogSection';
import ServicesSection from '@/components/site/ServicesSection';
import PortfolioSection from '@/components/site/PortfolioSection';
import GraniteSection from '@/components/site/GraniteSection';
import ContactsSection from '@/components/site/ContactsSection';
import Footer from '@/components/site/Footer';

interface Props {
  monuments: Monument[];
  services: Service[];
  portfolio: Portfolio[];
  graniteTypes: GraniteType[];
  menuItems: MenuItem[];
  settings: SiteSettings;
  onAdminClick: () => void;
  onUpdateMonuments: (v: Monument[]) => void;
  onUpdateServices: (v: Service[]) => void;
  onUpdatePortfolio: (v: Portfolio[]) => void;
  onUpdateGraniteTypes: (v: GraniteType[]) => void;
}

export default function Index({
  monuments, services, portfolio, graniteTypes, menuItems, settings,
  onAdminClick,
}: Props) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Header menuItems={menuItems} settings={settings} onAdminClick={onAdminClick} />
      <main className="pt-16">
        <HeroSection settings={settings} />
        <CatalogSection
          monuments={monuments}
          onMonumentClick={(slug) => navigate(`/monument/${slug}`)}
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
