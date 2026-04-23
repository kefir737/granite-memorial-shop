import { useState, useEffect } from 'react';
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
import AdminPanel from '@/components/admin/AdminPanel';
import Index from './Index';
import DynamicPage from './DynamicPage';

export default function AppShell() {
  const [monuments, setMonuments] = useState<Monument[]>(defaultMonuments);
  const [services, setServices] = useState<Service[]>(defaultServices);
  const [portfolio, setPortfolio] = useState<Portfolio[]>(defaultPortfolio);
  const [graniteTypes, setGraniteTypes] = useState<GraniteType[]>(defaultGraniteTypes);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenuItems);
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [loading, setLoading] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);
  const navigate = useNavigate();

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

  const handleUpdateSettings = async (updated: SiteSettings) => {
    setSettings(updated);
    await saveSettings(settingsToFlat(updated)).catch(console.error);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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
        onClose={() => { setAdminOpen(false); navigate('/'); }}
      />
    );
  }

  const sharedProps = { settings, menuItems, onAdminClick: () => setAdminOpen(true) };

  return (
    <Routes>
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
      <Route path="/:slug" element={<DynamicPage {...sharedProps} />} />
    </Routes>
  );
}