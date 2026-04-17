import { TemplatePage } from '../components/TemplatePage';
import { setupUserSettingsPage } from '../lib/pageBehaviors';
import { userSettingsHtml } from '../lib/pageSources';

export default function UserSettingsPage() {
  return <TemplatePage pageKey="user-settings" rawHtml={userSettingsHtml} setup={setupUserSettingsPage} />;
}
