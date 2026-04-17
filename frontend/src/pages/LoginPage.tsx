import { TemplatePage } from '../components/TemplatePage';
import { setupLoginPage } from '../lib/pageBehaviors';
import { loginHtml } from '../lib/pageSources';

export default function LoginPage() {
  return <TemplatePage pageKey="login" rawHtml={loginHtml} setup={setupLoginPage} />;
}
