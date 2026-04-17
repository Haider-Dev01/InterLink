import { TemplatePage } from '../components/TemplatePage';
import { setupAdminDashboardPage } from '../lib/pageBehaviors';
import { dashboardAdministrateurHtml } from '../lib/pageSources';

export default function DashboardAdministrateurPage() {
  return (
    <TemplatePage
      pageKey="dashboard-administrateur"
      rawHtml={dashboardAdministrateurHtml}
      setup={setupAdminDashboardPage}
    />
  );
}
