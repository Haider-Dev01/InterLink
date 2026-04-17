import { TemplatePage } from '../components/TemplatePage';
import { setupRecruiterDashboardPage } from '../lib/pageBehaviors';
import { dashboardRecruteurHtml } from '../lib/pageSources';

export default function DashboardRecruteurPage() {
  return <TemplatePage pageKey="dashboard-recruteur" rawHtml={dashboardRecruteurHtml} setup={setupRecruiterDashboardPage} />;
}
