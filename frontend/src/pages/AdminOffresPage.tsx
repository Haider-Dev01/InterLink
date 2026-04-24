import { useEffect, useState } from 'react';
import { TemplatePage } from '../components/TemplatePage';
import { setupAdminOffresPage } from '../lib/pageBehaviors';
import { adminOffresHtml } from '../lib/pageSources';
import { adminService } from '../services/adminService';

export default function AdminOffresPage() {
  const [offers, setOffers] = useState<any[]>([]);

  useEffect(() => {
    adminService.getOffers().then(res => {
      if (res.success && res.data) {
        setOffers(res.data);
      }
    });
  }, []);

  return <TemplatePage pageKey="admin-offres" rawHtml={adminOffresHtml} setup={(args) => setupAdminOffresPage({ ...args, offers })} />;
}
