import { TemplatePage } from '../components/TemplatePage';
import { setupRegisterPage } from '../lib/pageBehaviors';
import { registerHtml } from '../lib/pageSources';

export default function SignupPage() {
  return <TemplatePage pageKey="signup" rawHtml={registerHtml} setup={setupRegisterPage} />;
}
