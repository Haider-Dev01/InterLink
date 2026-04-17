import { TemplatePage } from '../components/TemplatePage';
import { setupAdminUsersPage } from '../lib/pageBehaviors';
import { adminUtilisateursHtml } from '../lib/pageSources';

export default function AdminUtilisateursPage() {
  return <TemplatePage pageKey="admin-utilisateurs" rawHtml={adminUtilisateursHtml} setup={setupAdminUsersPage} />;
}
