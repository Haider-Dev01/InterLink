import { TemplatePage } from '../components/TemplatePage';
import { setupCandidateDashboardPage } from '../lib/pageBehaviors';
import { dashboardCandidatHtml } from '../lib/pageSources';

export default function DashboardCandidatPage() {
  return <TemplatePage pageKey="dashboard-candidat" rawHtml={dashboardCandidatHtml} setup={setupCandidateDashboardPage} />;
}
