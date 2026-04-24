import { useEffect, useState } from 'react';
import { TemplatePage } from '../components/TemplatePage';
import { setupAdminDashboardPage } from '../lib/pageBehaviors';
import { dashboardAdministrateurHtml } from '../lib/pageSources';
import { adminService } from '../services/adminService';

export default function DashboardAdministrateurPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    adminService.getStats().then(res => {
      if (res.success && res.data) {
        setStats(res.data);
      }
    });
  }, []);

  return (
    <TemplatePage
      pageKey="dashboard-administrateur"
      rawHtml={dashboardAdministrateurHtml}
      setup={(args) => setupAdminDashboardPage({ ...args, stats })}
    />
  );
}
