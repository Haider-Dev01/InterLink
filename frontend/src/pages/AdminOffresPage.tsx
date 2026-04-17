import { TemplatePage } from '../components/TemplatePage';
import { setupAdminOffresPage } from '../lib/pageBehaviors';
import { adminOffresHtml } from '../lib/pageSources';

export default function AdminOffresPage() {
  return <TemplatePage pageKey="admin-offres" rawHtml={adminOffresHtml} setup={setupAdminOffresPage} />;
}
